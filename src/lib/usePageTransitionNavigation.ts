import { useCallback } from 'react';
import type { MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { runCirclePageTransition } from '@/lib/pageTransition';

type TransitionClickOptions = {
  beforeNavigate?: () => void;
};

const normalizePath = (value: string) => value.replace(/\/$/, '') || '/';

export function usePageTransitionNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback((
    event: MouseEvent<HTMLElement>,
    to: string,
    options: TransitionClickOptions = {},
  ) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.shiftKey
    ) {
      return false;
    }

    const linkTarget = event.currentTarget instanceof HTMLAnchorElement
      ? event.currentTarget.target
      : '';
    if (linkTarget && linkTarget !== '_self') return false;

    const destinationUrl = new URL(to, window.location.origin);
    if (destinationUrl.origin !== window.location.origin) return false;

    const destination = `${destinationUrl.pathname}${destinationUrl.search}${destinationUrl.hash}`;
    const current = `${location.pathname}${location.search}${location.hash}`;
    if (normalizePath(destination) === normalizePath(current)) {
      options.beforeNavigate?.();
      return false;
    }

    event.preventDefault();
    options.beforeNavigate?.();

    const usesDocumentNavigation = normalizePath(destinationUrl.pathname) === '/';

    const go = () => {
      if (usesDocumentNavigation) {
        window.location.assign(destination);
        return;
      }

      navigate(destination);
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      go();
      return true;
    }

    runCirclePageTransition({
      originX: event.clientX,
      originY: event.clientY,
      fallbackElement: event.currentTarget,
      onCovered: go,
      holdAfterCovered: usesDocumentNavigation,
    });

    return true;
  }, [location.hash, location.pathname, location.search, navigate]);
}
