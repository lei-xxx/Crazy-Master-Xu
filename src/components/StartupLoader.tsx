import { useEffect, useState } from 'react';
import { HOME_SCENE_READY_EVENT, isHomeSceneReady, preloadHomeSceneModule } from '@/lib/homeScenePreload';
import { publicAsset } from '../lib/utils';

const MIN_VISIBLE_MS = 2000;
const MAX_WAIT_MS = 1800;
const HOME_SCENE_WAIT_MS = 3000;
const LEAVE_ANIMATION_MS = 650;
const FAILSAFE_HIDE_MS = 4200;

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

const isInitialHomeRoute = () => {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
  const normalizedBase = basePath.replace(/\/$/, '') || '/';
  const normalizedPath = window.location.pathname.replace(/\/$/, '') || '/';

  return normalizedPath === normalizedBase;
};

const waitForHomeScene = async () => {
  if (!isInitialHomeRoute() || isHomeSceneReady()) return;

  void preloadHomeSceneModule().catch(() => {
    // The homepage effect has its own timeout path; do not block the loader on CDN failure.
  });

  await Promise.race([
    new Promise<void>((resolve) => {
      window.addEventListener(HOME_SCENE_READY_EVENT, () => resolve(), { once: true });
    }),
    wait(HOME_SCENE_WAIT_MS),
  ]);
};

const waitForCriticalResources = async () => {
  const fontReady = 'fonts' in document ? document.fonts.ready : Promise.resolve();

  await Promise.race([
    Promise.allSettled([fontReady, preloadVisibleImages(), waitForHomeScene()]),
    wait(MAX_WAIT_MS + HOME_SCENE_WAIT_MS),
  ]);
};

export default function StartupLoader() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!isInitialHomeRoute()) return;

    let isMounted = true;
    let isHiding = false;
    let failsafeTimer = 0;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setShouldRender(true);

    const hideLoader = async () => {
      if (!isMounted || isHiding) return;
      isHiding = true;
      await waitForNextPaint();
      if (!isMounted) return;
      setIsLeaving(true);
      await wait(LEAVE_ANIMATION_MS);

      if (!isMounted) return;
      window.clearTimeout(failsafeTimer);
      document.body.style.overflow = previousOverflow;
      setShouldRender(false);
    };

    const runLoader = async () => {
      try {
        const startedAt = performance.now();
        await waitForCriticalResources();

        const elapsed = performance.now() - startedAt;
        if (elapsed < MIN_VISIBLE_MS) {
          await wait(MIN_VISIBLE_MS - elapsed);
        }
      } finally {
        await hideLoader();
      }
    };

    failsafeTimer = window.setTimeout(() => {
      void hideLoader();
    }, FAILSAFE_HIDE_MS);

    void runLoader();

    return () => {
      isMounted = false;
      window.clearTimeout(failsafeTimer);
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
