import { useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { projects } from '@/data/projects';
import { markHomeSceneReady, preloadHomeSceneModule, resetHomeSceneReady } from '@/lib/homeScenePreload';
import { runCirclePageTransition } from '@/lib/pageTransition';
import { publicAsset } from '@/lib/utils';
import { usePageTransitionNavigation } from '@/lib/usePageTransitionNavigation';
import './HomePage.css';

const aboutWords = [
  "I'm", 'a', 'UI/UX', 'designer', 'who', 'enjoys', 'making', 'products', 'feel', 'simple,', 'useful,', 'and', 'a', 'little', 'more', 'human.', 'I', 'like', 'playful', 'details,', 'clean', 'systems,', 'and', 'the', 'occasional', 'weird', 'idea', 'that', 'somehow', 'works.',
];

const selectedProjectSlugs = [
  'personnel-logistics-management-system',
  'petro-mesh-international-dmcc',
  'personnel-positioning-system',
  'smart-park-management-system',
  'human-resources-management-system',
  'customer-management-system',
];

const mobileHiddenProjectSlugs = new Set([
  'smart-park-management-system',
  'customer-management-system',
]);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp01((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
};
const lerp = (start: number, end: number, amount: number) => start + (end - start) * amount;

const setDockState = (node: HTMLElement, prefix: string, x: number, y: number, scale: number) => {
  node.style.setProperty(`--${prefix}-x`, `${x.toFixed(2)}px`);
  node.style.setProperty(`--${prefix}-y`, `${y.toFixed(2)}px`);
  node.style.setProperty(`--${prefix}-scale`, scale.toFixed(3));
};

const resetDock = (node: HTMLElement, prefix: string) => {
  setDockState(node, prefix, 0, 0, 1);
};

const updateMagneticDock = (
  node: HTMLElement,
  event: PointerEvent | React.PointerEvent<HTMLElement>,
  prefix: string,
  options: { bound?: number; x?: number; y?: number; scale?: number } = {},
) => {
  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !window.matchMedia('(hover: hover) and (pointer: fine)').matches
  ) {
    resetDock(node, prefix);
    return;
  }

  const rect = node.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const deltaX = event.clientX - centerX;
  const deltaY = event.clientY - centerY;
  const distance = Math.hypot(deltaX, deltaY);
  const bound = Math.max(rect.width, rect.height) * (options.bound ?? 0.72);
  const proximity = Math.max(0, 1 - distance / bound);
  const x = (deltaX / rect.width) * (options.x ?? 16) * proximity;
  const y = (deltaY / rect.height) * (options.y ?? 14) * proximity;
  const scale = 1 + (options.scale ?? 0.065) * proximity;

  setDockState(node, prefix, x, y, scale);
};

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigateWithTransition = usePageTransitionNavigation();
  const homeRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const aboutPanelRef = useRef<HTMLParagraphElement | null>(null);
  const workPanelRef = useRef<HTMLElement | null>(null);
  const projectListRef = useRef<HTMLDivElement | null>(null);

  const selectedProjects = useMemo(
    () => selectedProjectSlugs.map((slug) => projects.find((project) => project.slug === slug)).filter(Boolean),
    [],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const restoreKey = 'xulei-pending-scroll-restore';
    const rawValue = window.sessionStorage.getItem(restoreKey);
    if (!rawValue) return;

    try {
      const restoreState = JSON.parse(rawValue) as { returnTo?: string; scrollY?: number; scrollTarget?: string; timestamp?: number };
      const currentPath = `${location.pathname}${location.search}${location.hash}`;
      const currentPathWithoutHash = `${location.pathname}${location.search}`;
      const restorePathWithoutHash = restoreState.returnTo?.split('#')[0];
      const isExpired = Boolean(restoreState.timestamp && Date.now() - restoreState.timestamp > 30 * 60 * 1000);
      const isCurrentRoute = restoreState.returnTo === currentPath || restorePathWithoutHash === currentPathWithoutHash;

      if (isExpired || !isCurrentRoute) return;

      window.sessionStorage.removeItem(restoreKey);
      window.requestAnimationFrame(() => {
        if (restoreState.scrollTarget) {
          document.querySelector(restoreState.scrollTarget)?.scrollIntoView({ block: 'start', behavior: 'auto' });
          return;
        }

        if (typeof restoreState.scrollY === 'number') {
          window.scrollTo({ top: restoreState.scrollY, left: 0, behavior: 'auto' });
        }
      });
    } catch {
      window.sessionStorage.removeItem(restoreKey);
    }
  }, [location.hash, location.pathname, location.search]);

  useEffect(() => {
    const mount = sceneRef.current;
    const home = homeRef.current;
    const aboutPanel = aboutPanelRef.current;
    const workPanel = workPanelRef.current;
    const projectRotatorList = projectListRef.current;
    if (!mount || !home || !aboutPanel || !workPanel || !projectRotatorList) return;

    let disposed = false;
    let cleanupScene = () => {};
    resetHomeSceneReady();

    void preloadHomeSceneModule().then((THREE) => {
      if (disposed) return;

    let viewportHeight = window.innerHeight || 1;
    let isMobileViewport = window.matchMedia('(max-width: 767px)').matches;
    let animationFrame = 0;
    const variableCache = new Map<string, string>();
    const documentStyle = document.documentElement.style;
    const rootStyles = getComputedStyle(home);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(1.2, 48);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointLightPos: { value: new THREE.Vector3(0, 0, 5) },
        color: { value: new THREE.Color(rootStyles.getPropertyValue('--sky-300').trim() || '#ffffff') },
        opacity: { value: 1 },
      },
      vertexShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;

        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0) * 2.0 + 1.0;
          vec4 s1 = floor(b1) * 2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
        }

        void main() {
          vNormal = normal;
          vPosition = position;
          float displacement = snoise(position * 2.0 + time * 0.5) * 0.2;
          vec3 newPosition = position + normal * displacement;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform vec3 pointLightPos;
        uniform float opacity;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 lightDir = normalize(pointLightPos - vPosition);
          float diffuse = max(dot(normal, lightDir), 0.0);
          float fresnel = 1.0 - dot(normal, vec3(0.0, 0.0, 1.0));
          fresnel = pow(fresnel, 2.0);
          float contrast = pow(diffuse, 1.55) * 1.45 + pow(fresnel, 2.25) * 0.82;
          contrast = smoothstep(0.06, 0.92, contrast);
          vec3 finalColor = color * contrast;
          gl_FragColor = vec4(finalColor, opacity);
        }
      `,
      wireframe: true,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    const setRootVariable = (name: string, value: string) => {
      if (variableCache.get(name) === value) return;
      variableCache.set(name, value);
      documentStyle.setProperty(name, value);
    };

    const updateCachedLayoutMetrics = () => {
      viewportHeight = window.innerHeight || 1;
      isMobileViewport = window.matchMedia('(max-width: 767px)').matches;
    };

    const animate = (t: number) => {
      const currentScroll = window.scrollY || window.pageYOffset || 0;
      const easedScrollProgress = currentScroll / viewportHeight;
      const toLeftBottom = smoothstep(0, 1, easedScrollProgress);
      const toProjectCenter = smoothstep(1, 2, easedScrollProgress);
      const timing = isMobileViewport
        ? {
            introStart: 0.04,
            introEnd: 0.34,
            aboutStart: 0.62,
            aboutEnd: 0.76,
            aboutExitStart: 1.28,
            aboutExitEnd: 1.54,
            workStart: 1.08,
            workEnd: 1.34,
          }
        : {
            introStart: 0.08,
            introEnd: 0.46,
            aboutStart: 0.82,
            aboutEnd: 0.98,
            aboutExitStart: 1.18,
            aboutExitEnd: 1.5,
            workStart: 1.38,
            workEnd: 1.68,
          };
      const introFade = smoothstep(timing.introStart, timing.introEnd, easedScrollProgress);
      const aboutFadeIn = smoothstep(timing.aboutStart, timing.aboutEnd, easedScrollProgress);
      const aboutFadeOut = smoothstep(timing.aboutExitStart, timing.aboutExitEnd, easedScrollProgress);
      const aboutIsVisible = aboutFadeIn > 0.02 && aboutFadeOut < 0.98;
      const aboutIsExiting = aboutFadeOut > 0.02 && aboutFadeOut < 0.98;
      const workProgress = smoothstep(timing.workStart, timing.workEnd, easedScrollProgress);
      const leftBottomX = lerp(0, -1.55, toLeftBottom);
      const leftBottomY = lerp(0, -0.92, toLeftBottom);
      const largeScale = lerp(0.72, 1.34, toLeftBottom);
      const sceneX = lerp(leftBottomX, 0, toProjectCenter);
      const sceneY = lerp(leftBottomY, 0, toProjectCenter);
      const sceneScale = lerp(largeScale, 4.1, toProjectCenter);

      mesh.position.x = sceneX;
      mesh.position.y = sceneY;
      mesh.scale.set(sceneScale, sceneScale, sceneScale);
      material.uniforms.opacity.value = lerp(1, 0.2, smoothstep(1.72, 2.08, easedScrollProgress));
      setRootVariable('--intro-opacity', `${1 - introFade}`);
      aboutPanel.classList.toggle('is-visible', aboutIsVisible);
      aboutPanel.classList.toggle('is-exiting', aboutIsExiting);
      const visibleWorkOpacity = workProgress;
      const workEnterY = (1 - workProgress) * 72;
      setRootVariable('--work-opacity', `${visibleWorkOpacity}`);
      setRootVariable('--work-enter-y', `${workEnterY}px`);
      workPanel.classList.toggle('is-visible', visibleWorkOpacity > 0.02);
      setRootVariable('--radial-mask-opacity', `${smoothstep(1.86, 2.16, easedScrollProgress)}`);
      material.uniforms.time.value = t * 0.0003;
      mesh.rotation.y += 0.0005;
      mesh.rotation.x += 0.0002;
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };

    const resize = () => {
      updateCachedLayoutMetrics();
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      const vec = new THREE.Vector3(x, y, 0.5).unproject(camera);
      const dir = vec.sub(camera.position).normalize();
      const dist = -camera.position.z / dir.z;
      const pos = camera.position.clone().add(dir.multiplyScalar(dist));
      pointLight.position.copy(pos);
      material.uniforms.pointLightPos.value.copy(pos);
    };

    const dockNodes = [
      home.querySelector<HTMLElement>('.copy'),
      aboutPanel,
      ...Array.from(home.querySelectorAll<HTMLElement>('.home-content-dock')),
    ].filter(Boolean) as HTMLElement[];
    const dockHandlers = dockNodes.map((dock) => {
      const move = (event: PointerEvent) => updateMagneticDock(dock, event, 'content-dock', { bound: 1.05, x: 6, y: 5, scale: 0.018 });
      const leave = () => resetDock(dock, 'content-dock');
      dock.addEventListener('pointermove', move);
      dock.addEventListener('pointerleave', leave);
      return { dock, move, leave };
    });

    const setProjectGridHoverColumn = (index?: number) => {
      projectRotatorList.classList.remove('is-hovering-col-1', 'is-hovering-col-2', 'is-hovering-col-3');
      if (typeof index !== 'number') return;
      projectRotatorList.classList.add(`is-hovering-col-${(index % 3) + 1}`);
    };

    const items = Array.from(home.querySelectorAll<HTMLElement>('.project-rotator-item'));
    const itemHandlers = items.map((item, index) => {
      const enter = () => setProjectGridHoverColumn(index);
      const leave = () => setProjectGridHoverColumn();
      item.addEventListener('pointerenter', enter);
      item.addEventListener('pointerleave', leave);
      return { item, enter, leave };
    });
    const listLeave = () => setProjectGridHoverColumn();
    projectRotatorList.addEventListener('pointerleave', listLeave);

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    updateCachedLayoutMetrics();
    resize();
    renderer.render(scene, camera);
    markHomeSceneReady();
    animationFrame = window.requestAnimationFrame(animate);

    cleanupScene = () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      dockHandlers.forEach(({ dock, move, leave }) => {
        dock.removeEventListener('pointermove', move);
        dock.removeEventListener('pointerleave', leave);
      });
      itemHandlers.forEach(({ item, enter, leave }) => {
        item.removeEventListener('pointerenter', enter);
        item.removeEventListener('pointerleave', leave);
      });
      projectRotatorList.removeEventListener('pointerleave', listLeave);
      mount.replaceChildren();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      ['--intro-opacity', '--work-opacity', '--work-enter-y', '--radial-mask-opacity'].forEach((name) => {
        documentStyle.removeProperty(name);
      });
      resetHomeSceneReady();
    };
    }).catch(() => {
      if (!disposed) markHomeSceneReady();
    });

    return () => {
      disposed = true;
      cleanupScene();
    };
  }, []);

  const openProject = (project: (typeof projects)[number], event: React.MouseEvent<HTMLButtonElement>) => {
    const destination = `/portfolio/${encodeURIComponent(project.slug)}`;
    const returnTo = `${window.location.pathname}${window.location.search}#portfolio`;
    const returnScrollY = workPanelRef.current?.offsetTop ?? window.scrollY ?? window.pageYOffset ?? 0;
    const returnScrollTarget = '#portfolio';

    window.sessionStorage.setItem(
      'xulei-project-return',
      JSON.stringify({
        slug: project.slug,
        returnTo,
        returnScrollY,
        returnScrollTarget,
        timestamp: Date.now(),
      }),
    );

    runCirclePageTransition({
      originX: event.clientX,
      originY: event.clientY,
      fallbackElement: event.currentTarget,
      onCovered: () => navigate(destination, { state: { fromPortfolioTransition: true, returnTo, returnScrollY, returnScrollTarget } }),
    });
  };

  return (
    <div ref={homeRef} className="current-home">
      <section id="top" className="hero" role="banner">
        <div ref={sceneRef} id="scene" />
        <div className="gradient" />
        <div className="radial-mask" />
        <div className="content">
          <div className="copy">
            <h1>UI/UX Design</h1>
            <p className="subtitle">This is Crazy Xu's personal website.</p>
            <p className="description">Passionate about design, art, and storytelling. Every project tells a story.</p>
          </div>
        </div>
        <p
          ref={aboutPanelRef}
          className="about-panel"
          aria-label="I'm a UI/UX designer who enjoys making products feel simple, useful, and a little more human. I like playful details, clean systems, and the occasional weird idea that somehow works."
        >
          {aboutWords.map((word, index) => (
            <span key={`${word}-${index}`} className="text-word" aria-hidden="true" style={{ '--word-index': index } as React.CSSProperties}>
              {word}{index === aboutWords.length - 1 ? '' : '\u00a0'}
            </span>
          ))}
        </p>
        <section ref={workPanelRef} id="portfolio" className="work-panel" aria-label="Selected projects">
          <div className="work-sticky">
            <div className="work-header">
              <h2 className="work-title home-content-dock">Selected projects, from idea to interface</h2>
              <Link
                className="work-link home-content-dock"
                to="/portfolio"
                onClick={(event) => navigateWithTransition(event, '/portfolio')}
                aria-label="See all selected projects"
              >
                See all
                <svg className="work-link-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
            <div className="work-divider" />
            <div className="project-rotator" aria-label="Selected project previews">
              <div ref={projectListRef} className="project-rotator-list">
                {selectedProjects.map((project, index) => {
                  const isMobileHiddenProject = mobileHiddenProjectSlugs.has(project.slug);
                  return (
                    <article
                      className={`project-rotator-item${isMobileHiddenProject ? ' project-rotator-item-mobile-hidden' : ''}`}
                      data-project-index={index}
                      key={project.slug}
                    >
                    <button
                      className="portfolio-project-image-dock project-rotator-image-dock"
                      type="button"
                      data-project-url={`/portfolio/${encodeURIComponent(project.slug)}`}
                      data-project-slug={project.slug}
                      aria-label={`View ${project.title} project`}
                      onClick={(event) => openProject(project, event)}
                      onPointerMove={(event) => updateMagneticDock(event.currentTarget, event, 'project-image-dock', { bound: 2.2, x: 8, y: 7, scale: 0.03 })}
                      onPointerLeave={(event) => resetDock(event.currentTarget, 'project-image-dock')}
                    >
                      <img
                        className="portfolio-project-image project-rotator-image"
                        src={publicAsset(project.cover || project.images.desktop)}
                        alt={`${project.title} project preview`}
                        loading="eager"
                        decoding="async"
                      />
                    </button>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        <footer className="site-footer" aria-label="Footer">
          <div className="site-footer-inner">
            <section>
              <h3 className="site-footer-title home-content-dock">Crazy Master Xu</h3>
              <p className="site-footer-copy home-content-dock">
                Welcome to my portfolio website of design works, let's explore the stories of inspiration through creation together.
              </p>
              <div className="site-footer-contact">
                <div className="site-footer-contact-item home-content-dock">
                  <svg className="site-footer-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 6h16v12H4V6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                  <span>xuleixulei2021@qq.com</span>
                </div>
                <div className="site-footer-contact-item home-content-dock">
                  <svg className="site-footer-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6.6 3.8 9.3 4.4l1.2 4-1.8 1.2c.9 1.9 2.4 3.4 4.3 4.4l1.3-1.8 4 1.2.6 2.7c.2.8-.2 1.6-1 1.9-2 .8-4.8.2-7.5-1.5-2.2-1.4-4.1-3.3-5.5-5.5-1.7-2.7-2.3-5.5-1.5-7.5.3-.8 1.1-1.2 1.9-1Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                  <span>18406593255</span>
                </div>
                <div className="site-footer-contact-item home-content-dock">
                  <svg className="site-footer-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span>China, Shenzhen</span>
                </div>
                <a className="site-footer-link home-content-dock" href="https://www.zcool.com.cn/u/24205250" target="_blank" rel="noreferrer">
                  <svg className="site-footer-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M7 17 17 7M17 7H8M17 7v9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>zcool.com.cn/u/24205250</span>
                </a>
              </div>
            </section>
            <nav aria-label="Quick links">
              <h4 className="site-footer-heading home-content-dock">Quick Links</h4>
              <ul className="site-footer-list">
                <li><Link className="site-footer-link home-content-dock" to="/" onClick={(event) => navigateWithTransition(event, '/')}>Home</Link></li>
                <li><Link className="site-footer-link home-content-dock" to="/contact" onClick={(event) => navigateWithTransition(event, '/contact')}>Contact</Link></li>
                <li><Link className="site-footer-link home-content-dock" to="/portfolio" onClick={(event) => navigateWithTransition(event, '/portfolio')}>Portfolio</Link></li>
              </ul>
            </nav>
            <section>
              <h4 className="site-footer-heading home-content-dock">Services</h4>
              <ul className="site-footer-list">
                <li><span className="site-footer-service home-content-dock">Full-stack UI/UX design (app, web, data visualization)</span></li>
                <li><span className="site-footer-service home-content-dock">B-end complex system design</span></li>
                <li><span className="site-footer-service home-content-dock">Motion Effect Design</span></li>
              </ul>
            </section>
          </div>
          <div className="site-footer-rule" />
          <div className="site-footer-bottom">
            <span className="home-content-dock">© 2026 Crazy Master Xu. All rights reserved.</span>
            <div className="site-footer-legal">
              <Link className="site-footer-link home-content-dock" to="/privacy" onClick={(event) => navigateWithTransition(event, '/privacy')}>Privacy Policy</Link>
              <Link className="site-footer-link home-content-dock" to="/terms" onClick={(event) => navigateWithTransition(event, '/terms')}>Terms of Service</Link>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
