import { useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Triangle } from 'ogl';
import './Prism.css';

type AnimationType = 'rotate' | 'hover' | '3drotate';

interface PrismProps {
  height?: number;
  baseWidth?: number;
  animationType?: AnimationType;
  glow?: number;
  offset?: { x?: number; y?: number };
  noise?: number;
  transparent?: boolean;
  scale?: number;
  hueShift?: number;
  colorFrequency?: number;
  hoverStrength?: number;
  inertia?: number;
  bloom?: number;
  suspendWhenOffscreen?: boolean;
  timeScale?: number;
}

interface PrismHost extends HTMLDivElement {
  __prismIO?: IntersectionObserver;
}

const VERT = `
  attribute vec2 position;

  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAG = `
  precision highp float;

  uniform vec2  iResolution;
  uniform float iTime;

  uniform float uHeight;
  uniform float uBaseHalf;
  uniform mat3  uRot;
  uniform int   uUseBaseWobble;
  uniform float uGlow;
  uniform vec2  uOffsetPx;
  uniform float uNoise;
  uniform float uSaturation;
  uniform float uScale;
  uniform float uHueShift;
  uniform float uColorFreq;
  uniform float uBloom;
  uniform float uCenterShift;
  uniform float uInvBaseHalf;
  uniform float uInvHeight;
  uniform float uMinAxis;
  uniform float uPxScale;
  uniform float uTimeScale;

  vec4 tanh4(vec4 x) {
    vec4 e2x = exp(2.0 * x);
    return (e2x - 1.0) / (e2x + 1.0);
  }

  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float sdOctaAnisoInv(vec3 p) {
    vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);
    float m = q.x + q.y + q.z - 1.0;
    return m * uMinAxis * 0.5773502691896258;
  }

  float sdPyramidUpInv(vec3 p) {
    float oct = sdOctaAnisoInv(p);
    float halfSpace = -p.y;
    return max(oct, halfSpace);
  }

  mat3 hueRotation(float a) {
    float c = cos(a), s = sin(a);
    mat3 W = mat3(
      0.299, 0.587, 0.114,
      0.299, 0.587, 0.114,
      0.299, 0.587, 0.114
    );
    mat3 U = mat3(
       0.701, -0.587, -0.114,
      -0.299,  0.413, -0.114,
      -0.300, -0.588,  0.886
    );
    mat3 V = mat3(
       0.168, -0.331,  0.500,
       0.328,  0.035, -0.500,
      -0.497,  0.296,  0.201
    );
    return W + U * c + V * s;
  }

  void main() {
    vec2 f = (gl_FragCoord.xy - 0.5 * iResolution.xy - uOffsetPx) * uPxScale;

    float z = 5.0;
    float d = 0.0;
    vec3 p;
    vec4 o = vec4(0.0);

    mat2 wob = mat2(1.0);
    if (uUseBaseWobble == 1) {
      float t = iTime * uTimeScale;
      float c0 = cos(t + 0.0);
      float c1 = cos(t + 33.0);
      float c2 = cos(t + 11.0);
      wob = mat2(c0, c1, c2, c0);
    }

    const int STEPS = 100;
    for (int i = 0; i < STEPS; i++) {
      p = vec3(f, z);
      p.xz = p.xz * wob;
      p = uRot * p;
      vec3 q = p;
      q.y += uCenterShift;
      d = 0.1 + 0.2 * abs(sdPyramidUpInv(q));
      z -= d;
      o += (sin((p.y + z) * uColorFreq + vec4(0.0, 1.0, 2.0, 3.0)) + 1.0) / d;
    }

    o = tanh4(o * o * (uGlow * uBloom) / 1e5);

    vec3 col = o.rgb;
    float n = rand(gl_FragCoord.xy + vec2(iTime));
    col += (n - 0.5) * uNoise;
    col = clamp(col, 0.0, 1.0);

    float L = dot(col, vec3(0.2126, 0.7152, 0.0722));
    col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);

    if (abs(uHueShift) > 0.0001) {
      col = clamp(hueRotation(uHueShift) * col, 0.0, 1.0);
    }

    gl_FragColor = vec4(col, o.a);
  }
`;

function rotationMatrix(ax: number, ay: number, az: number, out: Float32Array) {
  const cx = Math.cos(ax);
  const sx = Math.sin(ax);
  const cy = Math.cos(ay);
  const sy = Math.sin(ay);
  const cz = Math.cos(az);
  const sz = Math.sin(az);

  out[0] = cx * cz + sx * sy * sz;
  out[1] = cy * sz;
  out[2] = -sx * cz + cx * sy * sz;
  out[3] = -cx * sz + sx * sy * cz;
  out[4] = cy * cz;
  out[5] = sx * sz + cx * sy * cz;
  out[6] = sx * cy;
  out[7] = -sy;
  out[8] = cx * cy;
  return out;
}

export default function Prism({
  height = 3.5,
  baseWidth = 5.5,
  animationType = 'rotate',
  glow = 1,
  offset = { x: 0, y: 0 },
  noise = 0.5,
  transparent = true,
  scale = 3.6,
  hueShift = 0,
  colorFrequency = 1,
  hoverStrength = 2,
  inertia = 0.05,
  bloom = 1,
  suspendWhenOffscreen = false,
  timeScale = 0.5
}: PrismProps) {
  const containerRef = useRef<PrismHost | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prismHeight = Math.max(0.001, height);
    const baseHalf = Math.max(0.001, baseWidth) * 0.5;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const renderer = new Renderer({ dpr, alpha: transparent, antialias: false });
    const gl = renderer.gl;

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
    Object.assign(gl.canvas.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      display: 'block'
    });
    container.appendChild(gl.canvas);

    const resolution = new Float32Array(2);
    const offsetPx = new Float32Array(2);
    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        iResolution: { value: resolution },
        iTime: { value: 0 },
        uHeight: { value: prismHeight },
        uBaseHalf: { value: baseHalf },
        uUseBaseWobble: { value: 1 },
        uRot: { value: new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]) },
        uGlow: { value: Math.max(0, glow) },
        uOffsetPx: { value: offsetPx },
        uNoise: { value: Math.max(0, noise) },
        uSaturation: { value: transparent ? 1.5 : 1 },
        uScale: { value: Math.max(0.001, scale) },
        uHueShift: { value: hueShift || 0 },
        uColorFreq: { value: Math.max(0, colorFrequency || 1) },
        uBloom: { value: Math.max(0, bloom || 1) },
        uCenterShift: { value: prismHeight * 0.25 },
        uInvBaseHalf: { value: 1 / baseHalf },
        uInvHeight: { value: 1 / prismHeight },
        uMinAxis: { value: Math.min(baseHalf, prismHeight) },
        uPxScale: { value: 1 / ((gl.drawingBufferHeight || 1) * 0.1 * Math.max(0.001, scale)) },
        uTimeScale: { value: Math.max(0, timeScale || 1) }
      }
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const width = container.clientWidth || 1;
      const heightPx = container.clientHeight || 1;
      renderer.setSize(width, heightPx);
      resolution[0] = gl.drawingBufferWidth;
      resolution[1] = gl.drawingBufferHeight;
      offsetPx[0] = (offset.x ?? 0) * dpr;
      offsetPx[1] = (offset.y ?? 0) * dpr;
      program.uniforms.uPxScale.value =
        1 / ((gl.drawingBufferHeight || 1) * 0.1 * Math.max(0.001, scale));
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const rot = new Float32Array(9);
    const random = () => Math.random();
    const speedX = 0.3 + random() * 0.6;
    const speedY = 0.2 + random() * 0.7;
    const speedZ = 0.1 + random() * 0.5;
    const phaseX = random() * Math.PI * 2;
    const phaseY = random() * Math.PI * 2;
    const pointer = { x: 0, y: 0, inside: true };

    let frame = 0;
    let x = 0;
    let y = 0;
    let z = 0;
    let targetX = 0;
    let targetY = 0;
    const start = performance.now();
    const still = noise < 1e-6;

    const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

    const updatePointer = (event: PointerEvent) => {
      const ww = Math.max(1, window.innerWidth);
      const wh = Math.max(1, window.innerHeight);
      pointer.x = Math.max(-1, Math.min(1, (event.clientX - ww * 0.5) / (ww * 0.5)));
      pointer.y = Math.max(-1, Math.min(1, (event.clientY - wh * 0.5) / (wh * 0.5)));
      pointer.inside = true;
      startLoop();
    };
    const leavePointer = () => {
      pointer.inside = false;
    };

    const render = (time: number) => {
      const elapsed = (time - start) * 0.001;
      program.uniforms.iTime.value = elapsed;
      let keepRunning = true;

      if (animationType === 'hover') {
        targetX = (pointer.inside ? pointer.y : 0) * 0.6 * hoverStrength;
        targetY = (pointer.inside ? -pointer.x : 0) * 0.6 * hoverStrength;
        x = lerp(x, targetX, inertia);
        y = lerp(y, targetY, inertia);
        z = lerp(z, 0, 0.1);
        program.uniforms.uRot.value = rotationMatrix(x, y, z, rot);
        if (still && Math.abs(x - targetX) < 1e-4 && Math.abs(y - targetY) < 1e-4 && Math.abs(z) < 1e-4) {
          keepRunning = false;
        }
      } else if (animationType === '3drotate') {
        const t = elapsed * Math.max(0, timeScale || 1);
        x = t * speedY;
        y = Math.sin(t * speedX + phaseX) * 0.6;
        z = Math.sin(t * speedZ + phaseY) * 0.5;
        program.uniforms.uRot.value = rotationMatrix(x, y, z, rot);
        if (timeScale < 1e-6) keepRunning = false;
      } else {
        rot[0] = 1;
        rot[1] = 0;
        rot[2] = 0;
        rot[3] = 0;
        rot[4] = 1;
        rot[5] = 0;
        rot[6] = 0;
        rot[7] = 0;
        rot[8] = 1;
        program.uniforms.uRot.value = rot;
        if (timeScale < 1e-6) keepRunning = false;
      }

      renderer.render({ scene: mesh });
      frame = keepRunning ? requestAnimationFrame(render) : 0;
    };

    const startLoop = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };
    const stopLoop = () => {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    if (animationType === 'hover') {
      program.uniforms.uUseBaseWobble.value = 0;
      window.addEventListener('pointermove', updatePointer, { passive: true });
      window.addEventListener('mouseleave', leavePointer);
      window.addEventListener('blur', leavePointer);
    } else if (animationType === '3drotate') {
      program.uniforms.uUseBaseWobble.value = 0;
    }

    if (suspendWhenOffscreen) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) startLoop();
        else stopLoop();
      });
      observer.observe(container);
      container.__prismIO = observer;
    }
    startLoop();

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      if (animationType === 'hover') {
        window.removeEventListener('pointermove', updatePointer);
        window.removeEventListener('mouseleave', leavePointer);
        window.removeEventListener('blur', leavePointer);
      }
      container.__prismIO?.disconnect();
      delete container.__prismIO;
      if (gl.canvas.parentElement === container) container.removeChild(gl.canvas);
    };
  }, [
    animationType,
    baseWidth,
    bloom,
    colorFrequency,
    glow,
    height,
    hoverStrength,
    inertia,
    noise,
    offset.x,
    offset.y,
    scale,
    suspendWhenOffscreen,
    hueShift,
    timeScale,
    transparent
  ]);

  return <div className="prism-container" ref={containerRef} />;
}
