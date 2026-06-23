import { useCallback, useEffect, useRef, useState } from 'react';
import type { Application } from '@splinetool/runtime';
import { SplineScene } from '@/components/ui/splite';

export function SplineRobotShowcase() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoadSpline, setShouldLoadSpline] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !window.matchMedia('(max-width: 1023px)').matches;
  });

  useEffect(() => {
    if (shouldLoadSpline) return;
    if (!window.matchMedia('(max-width: 1023px)').matches) {
      setShouldLoadSpline(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoadSpline(true);
        observer.disconnect();
      },
      { rootMargin: '200px 0px' },
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [shouldLoadSpline]);

  const handleSplineLoad = useCallback((spline: Application) => {
    if (!window.matchMedia('(max-width: 1023px)').matches) return;

    const mobilePixelRatio = 1;
    const internalSpline = spline as Application & {
      _renderer?: { setPixelRatio?: (ratio: number) => void };
      requestRender?: () => void;
    };

    internalSpline._renderer?.setPixelRatio?.(mobilePixelRatio);
    internalSpline.requestRender?.();
  }, []);

  return (
    <div ref={containerRef} className="relative isolate h-[560px] w-full overflow-hidden rounded-t-2xl rounded-b-[36px]">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0)_38%,rgba(0,0,0,0)_100%)]" />
      {shouldLoadSpline && (
        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="relative z-10 h-full w-full"
          onLoad={handleSplineLoad}
        />
      )}
      <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(to_top,rgba(0,0,0,1)_0%,rgba(0,0,0,0)_20%,rgba(0,0,0,0)_100%)]" />
    </div>
  );
}
