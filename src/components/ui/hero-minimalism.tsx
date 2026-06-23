"use client";

import React, { useEffect, useRef } from "react";

type MinimalHeroProps = {
  backgroundOnly?: boolean;
  className?: string;
  disableParticlesOnMobile?: boolean;
};

export default function MinimalHero({
  backgroundOnly = false,
  className = "",
  disableParticlesOnMobile = false,
}: MinimalHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mobileQuery = window.matchMedia("(max-width: 1023px)");
    if (disableParticlesOnMobile && mobileQuery.matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();

    type Particle = {
      x: number;
      y: number;
      speed: number;
      opacity: number;
      fadeDelay: number;
      fadeStart: number;
      fadingOut: boolean;
    };

    let particles: Particle[] = [];
    let raf = 0;

    const count = () => Math.floor((canvas.width * canvas.height) / 7000);

    const make = (): Particle => {
      const fadeDelay = Math.random() * 600 + 100;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() / 5 + 0.1,
        opacity: 0.7,
        fadeDelay,
        fadeStart: Date.now() + fadeDelay,
        fadingOut: false,
      };
    };

    const reset = (p: Particle) => {
      p.x = Math.random() * canvas.width;
      p.y = Math.random() * canvas.height;
      p.speed = Math.random() / 5 + 0.1;
      p.opacity = 0.7;
      p.fadeDelay = Math.random() * 600 + 100;
      p.fadeStart = Date.now() + p.fadeDelay;
      p.fadingOut = false;
    };

    const init = () => {
      particles = [];
      for (let i = 0; i < count(); i++) particles.push(make());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y -= p.speed;
        if (p.y < 0) reset(p);
        if (!p.fadingOut && Date.now() > p.fadeStart) p.fadingOut = true;
        if (p.fadingOut) {
          p.opacity -= 0.008;
          if (p.opacity <= 0) reset(p);
        }
        ctx.fillStyle = `rgba(250, 250, 250, ${p.opacity})`;
        ctx.fillRect(p.x, p.y, 0.6, Math.random() * 2 + 1);
      });
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      setSize();
      init();
    };

    window.addEventListener("resize", onResize);
    init();
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [disableParticlesOnMobile]);

  return (
    <section className={`minimal-root ${disableParticlesOnMobile ? "minimal-root--no-mobile-particles" : ""} ${className}`}>
      <style>{`
.minimal-root, .minimal-root * {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.minimal-root {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  --bg: #0a0a0a;
  --fg: #fafafa;
  --muted: #a1a1aa;
  --border: #27272a;
  background: var(--bg);
  color: var(--fg);
}

.minimal-root .particleCanvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: .6;
}

@media (max-width: 1023px) {
  .minimal-root--no-mobile-particles .particleCanvas {
    display: none;
  }
}

.minimal-root .accent-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.minimal-root .hline,
.minimal-root .vline {
  position: absolute;
  background: var(--border);
  opacity: .75;
  will-change: transform, opacity;
}

.minimal-root .hline {
  height: 1px;
  left: 0;
  right: 0;
  transform: scaleX(0);
  transform-origin: 50% 50%;
  animation: drawXLoop 6s cubic-bezier(.22,.61,.36,1) infinite;
}

.minimal-root .hline:nth-child(1){ top: 20%; animation-delay: 150ms; }
.minimal-root .hline:nth-child(2){ top: 50%; animation-delay: 280ms; }
.minimal-root .hline:nth-child(3){ top: 80%; animation-delay: 410ms; }

.minimal-root .vline {
  width: 1px;
  top: 0;
  bottom: 0;
  transform: scaleY(0);
  transform-origin: 50% 0%;
  animation: drawYLoop 6s cubic-bezier(.22,.61,.36,1) infinite;
}

.minimal-root .vline:nth-child(4){ left: 20%; animation-delay: 520ms; }
.minimal-root .vline:nth-child(5){ left: 50%; animation-delay: 640ms; }
.minimal-root .vline:nth-child(6){ left: 80%; animation-delay: 760ms; }

.minimal-root .hline::after,
.minimal-root .vline::after{
  content:"";
  position:absolute;
  inset:0;
  background: linear-gradient(90deg, transparent, rgba(250,250,250,.25), transparent);
  opacity:0;
  animation: shimmerLoop 6s ease-out infinite;
}

.minimal-root .hline:nth-child(1)::after{ animation-delay: 150ms; }
.minimal-root .hline:nth-child(2)::after{ animation-delay: 280ms; }
.minimal-root .hline:nth-child(3)::after{ animation-delay: 410ms; }
.minimal-root .vline:nth-child(4)::after{ animation-delay: 520ms; }
.minimal-root .vline:nth-child(5)::after{ animation-delay: 640ms; }
.minimal-root .vline:nth-child(6)::after{ animation-delay: 760ms; }

.minimal-root .hero {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  text-align: center;
  pointer-events: none;
}

.minimal-root .kicker {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 14px;
}

.minimal-root .title {
  font-weight: 600;
  font-size: clamp(32px, 8vw, 88px);
  line-height: 0.95;
  margin: 0;
  color: var(--fg);
}

.minimal-root .subtitle {
  margin-top: 18px;
  font-size: clamp(14px, 2.2vw, 18px);
  color: var(--muted);
}

.minimal-root .content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 32px 24px;
  border-top: 1px solid var(--border);
  display: grid;
  place-items: center;
  text-align: center;
  gap: 6px;
}

.minimal-root .content .tag {
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.minimal-root .content .heading {
  font-size: 22px;
  font-weight: 600;
  color: var(--fg);
}

.minimal-root .content .desc {
  font-size: 14px;
  color: var(--muted);
  max-width: 680px;
}

@keyframes drawXLoop {
  0% { transform: scaleX(0); opacity: 0; }
  8% { opacity: .9; }
  14% { transform: scaleX(1); opacity: .75; }
  92% { transform: scaleX(1); opacity: .75; }
  100% { transform: scaleX(0); opacity: 0; }
}

@keyframes drawYLoop {
  0% { transform: scaleY(0); opacity: 0; }
  8% { opacity: .9; }
  15% { transform: scaleY(1); opacity: .75; }
  92% { transform: scaleY(1); opacity: .75; }
  100% { transform: scaleY(0); opacity: 0; }
}

@keyframes shimmerLoop {
  0% { opacity: .0; }
  5% { opacity: .25; }
  15% { opacity: 0; }
  100% { opacity: 0; }
}
      `}</style>

      <canvas ref={canvasRef} className="particleCanvas" />
      <div className="accent-lines">
        <div className="hline" />
        <div className="hline" />
        <div className="hline" />
        <div className="vline" />
        <div className="vline" />
        <div className="vline" />
      </div>

      {!backgroundOnly && (
        <>
          <main className="hero">
            <div>
              <div className="kicker">Introducing</div>
              <h1 className="title">
                Build fast.
                <br />
                Ship clean.
              </h1>
              <p className="subtitle">
                A minimal React starter focused on clarity, speed, and maintainability.
              </p>
            </div>
          </main>

          <section className="content">
            <div className="tag">Designed for focus</div>
            <div className="heading">Composable. Accessible. Production-ready.</div>
            <p className="desc">
              Start with sensible defaults, ship without the noise, and scale your UI with confidence.
            </p>
          </section>
        </>
      )}
    </section>
  );
}
