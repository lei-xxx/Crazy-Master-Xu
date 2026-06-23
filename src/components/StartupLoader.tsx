import { useEffect, useState } from 'react';
import { publicAsset } from '../lib/utils';

const LOADER_SESSION_KEY = 'xulei-startup-loader-seen';
const MIN_VISIBLE_MS = 2000;
const MAX_WAIT_MS = 1800;
const LEAVE_ANIMATION_MS = 650;

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const waitForNextPaint = () =>
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });

const preloadVisibleImages = async () => {
  await waitForNextPaint();

  const viewportHeight = window.innerHeight;
  const visibleImages = Array.from(document.images)
    .filter((image) => {
      const rect = image.getBoundingClientRect();
      return rect.top < viewportHeight + 240 && rect.bottom > -120;
    })
    .slice(0, 6);

  await Promise.allSettled(
    visibleImages.map(async (image) => {
      if (image.complete) return;
      if (typeof image.decode === 'function') {
        await image.decode();
        return;
      }

      await new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => resolve(), { once: true });
      });
    }),
  );
};

const waitForCriticalResources = async () => {
  const fontReady = 'fonts' in document ? document.fonts.ready : Promise.resolve();

  await Promise.race([
    Promise.allSettled([fontReady, preloadVisibleImages()]),
    wait(MAX_WAIT_MS),
  ]);
};

export default function StartupLoader() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(LOADER_SESSION_KEY) === 'true') return;

    let isMounted = true;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setShouldRender(true);

    const runLoader = async () => {
      const startedAt = performance.now();
      await waitForCriticalResources();

      const elapsed = performance.now() - startedAt;
      if (elapsed < MIN_VISIBLE_MS) {
        await wait(MIN_VISIBLE_MS - elapsed);
      }

      if (!isMounted) return;
      await waitForNextPaint();
      if (!isMounted) return;
      sessionStorage.setItem(LOADER_SESSION_KEY, 'true');
      setIsLeaving(true);
      await wait(LEAVE_ANIMATION_MS);

      if (!isMounted) return;
      document.body.style.overflow = previousOverflow;
      setShouldRender(false);
    };

    void runLoader();

    return () => {
      isMounted = false;
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-[clip-path,-webkit-clip-path] duration-[650ms] ease-[cubic-bezier(.22,1,.36,1)] [will-change:clip-path] ${
        isLeaving
          ? '[clip-path:circle(0px_at_50%_50%)] [-webkit-clip-path:circle(0px_at_50%_50%)]'
          : '[clip-path:circle(150vmax_at_50%_50%)] [-webkit-clip-path:circle(150vmax_at_50%_50%)]'
      }`}
      aria-label="Loading"
      role="status"
    >
      <img
        src={publicAsset('/transition-assets/xulei-transition.png')}
        alt="XULEI"
        className="w-[68vw] max-w-[330px] select-none object-contain md:max-w-[380px]"
        draggable={false}
      />
    </div>
  );
}
