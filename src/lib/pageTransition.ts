import { publicAsset } from '@/lib/utils';

type CirclePageTransitionOptions = {
  originX?: number;
  originY?: number;
  fallbackElement?: HTMLElement;
  onCovered: () => void;
  onFinish?: () => void;
  holdAfterCovered?: boolean;
};

const STARTUP_LOADER_SESSION_KEY = 'xulei-startup-loader-seen';

const waitForNextPaint = (callback: () => void) => {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(callback);
  });
};

const HOLD_FALLBACK_MS = 1600;

export const runCirclePageTransition = ({
  originX,
  originY,
  fallbackElement,
  onCovered,
  onFinish,
  holdAfterCovered = false,
}: CirclePageTransitionOptions) => {
  const previousBodyOverflow = document.body.style.overflow;
  const triggerRect = fallbackElement?.getBoundingClientRect();
  const resolvedOriginX = originX ?? (triggerRect ? triggerRect.left + triggerRect.width / 2 : window.innerWidth / 2);
  const resolvedOriginY = originY ?? (triggerRect ? triggerRect.top + triggerRect.height / 2 : window.innerHeight / 2);
  const maxRadius = Math.ceil(Math.hypot(
    Math.max(resolvedOriginX, window.innerWidth - resolvedOriginX),
    Math.max(resolvedOriginY, window.innerHeight - resolvedOriginY),
  ));
  const finalSize = maxRadius * 2;
  const transitionCircle = document.createElement('div');
  const transitionMark = document.createElement('img');

  try {
    window.sessionStorage.setItem(STARTUP_LOADER_SESSION_KEY, 'true');
  } catch {
    // Session storage can be unavailable in strict privacy contexts.
  }

  document.body.style.overflow = 'hidden';

  transitionCircle.style.cssText = [
    'position:fixed',
    `left:${resolvedOriginX}px`,
    `top:${resolvedOriginY}px`,
    'width:1px',
    'height:1px',
    'z-index:90',
    'border-radius:9999px',
    'background:#000',
    'pointer-events:none',
    'overflow:hidden',
    'opacity:1',
    'will-change:left,top,width,height,opacity',
    'transition:left 620ms cubic-bezier(.22,1,.36,1), top 620ms cubic-bezier(.22,1,.36,1), width 620ms cubic-bezier(.22,1,.36,1), height 620ms cubic-bezier(.22,1,.36,1), opacity 280ms cubic-bezier(.22,1,.36,1)',
  ].join(';');

  transitionMark.src = publicAsset('/transition-assets/xulei-transition.png') ?? '/transition-assets/xulei-transition.png';
  transitionMark.alt = '';
  transitionMark.style.cssText = [
    'position:fixed',
    'left:50%',
    'top:50%',
    'z-index:91',
    'width:min(69.6vw,320px)',
    'height:auto',
    'transform:translate(-50%,-50%) scale(1)',
    'opacity:1',
    'pointer-events:none',
    'will-change:opacity,transform',
    'transition:opacity 280ms cubic-bezier(.22,1,.36,1), transform 280ms cubic-bezier(.22,1,.36,1)',
  ].join(';');

  document.body.appendChild(transitionCircle);
  document.body.appendChild(transitionMark);

  let isFinished = false;
  const finish = () => {
    if (isFinished) return;
    isFinished = true;

    waitForNextPaint(() => {
      transitionCircle.style.opacity = '0';
      transitionMark.style.opacity = '0';
      transitionMark.style.transform = 'translate(-50%,-50%) scale(1.02)';

      window.setTimeout(() => {
        transitionCircle.remove();
        transitionMark.remove();
        document.body.style.overflow = previousBodyOverflow;
        onFinish?.();
      }, 340);
    });
  };

  window.requestAnimationFrame(() => {
    transitionCircle.style.left = `${resolvedOriginX - maxRadius}px`;
    transitionCircle.style.top = `${resolvedOriginY - maxRadius}px`;
    transitionCircle.style.width = `${finalSize}px`;
    transitionCircle.style.height = `${finalSize}px`;
  });

  window.setTimeout(() => {
    try {
      onCovered();
    } catch (error) {
      finish();
      throw error;
    }

    if (holdAfterCovered) {
      window.setTimeout(finish, HOLD_FALLBACK_MS);
      return;
    }

    finish();
  }, 620);
};
