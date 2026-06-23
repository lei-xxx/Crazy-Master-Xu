import { forwardRef, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useAdaptiveButtonTone } from '@/lib/useAdaptiveButtonTone';
import { usePageTransitionNavigation } from '@/lib/usePageTransitionNavigation';
import { publicRoute } from '@/lib/utils';
import './SignFlowNav.css';

interface NavLinkItem {
  label: string;
  href: string;
}

interface SignFlowNavProps {
  logo: string;
  logoAlt?: string;
  links: NavLinkItem[];
  documentNavigation?: boolean;
}

type MagneticOptions = {
  bound?: number;
  x?: number;
  y?: number;
  scale?: number;
};

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
  event: React.PointerEvent<HTMLElement>,
  prefix: string,
  options: MagneticOptions = {},
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

const desktopNavMagneticOptions = {
  bound: 3.95,
  x: 10,
  y: 10,
  scale: 0.28,
};

const AnimatedNavLink = forwardRef<HTMLAnchorElement, {
  href: string;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}>(({ href, children, onClick }, ref) => (
  <Link
    ref={ref}
    to={href}
    onClick={onClick}
    onPointerMove={(event) => updateMagneticDock(event.currentTarget, event, 'nav-link-dock', desktopNavMagneticOptions)}
    onPointerLeave={(event) => resetDock(event.currentTarget, 'nav-link-dock')}
    className="sign-flow-nav-link relative inline-flex items-center text-[18px]">
    <span className="sign-flow-nav-track">
      <span className="sign-flow-nav-line text-gray-300">{children}</span>
      <span className="sign-flow-nav-line text-white">{children}</span>
    </span>
  </Link>
));

AnimatedNavLink.displayName = 'AnimatedNavLink';

export default function SignFlowNav({ logo, logoAlt = 'Logo', links, documentNavigation = false }: SignFlowNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const navigateWithTransition = usePageTransitionNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState('rounded-[48px]');
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const isMenuButtonOnLight = useAdaptiveButtonTone(
    menuButtonRef,
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches && !isOpen,
  );
  const desktopLogoRef = useRef<HTMLAnchorElement | null>(null);
  const tabletMenuRef = useRef<HTMLDivElement | null>(null);
  const tabletSpreadRef = useRef<HTMLDivElement | null>(null);
  const tabletPanelRefs = useRef<HTMLElement[]>([]);
  const tabletItemRefs = useRef<HTMLAnchorElement[]>([]);
  const tabletCtaRef = useRef<HTMLAnchorElement | null>(null);
  const tabletAnimationsRef = useRef<Set<Animation>>(new Set());
  const tabletPhaseRef = useRef<'closed' | 'opening' | 'open' | 'reversing' | 'exiting'>('closed');
  const tabletCycleRef = useRef(0);
  const shapeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollYRef = useRef(0);
  const isProjectDetailRoute = location.pathname.startsWith('/portfolio/');
  const projectDetailRouteClass = isProjectDetailRoute ? 'sign-flow-project-detail-route' : '';

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => {
    setIsOpen(current => !current);
  };
  const isActiveHref = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const handleNavigation = (href: string, beforeNavigate?: () => void) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!documentNavigation) {
      navigateWithTransition(event, href, { beforeNavigate });
      return;
    }

    event.preventDefault();
    beforeNavigate?.();
    window.location.assign(publicRoute(href));
  };

  const handleMenuNavigation = (href: string, beforeNavigate?: () => void) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    beforeNavigate?.();

    if (documentNavigation) {
      window.location.assign(publicRoute(href));
      return;
    }

    navigate(href);
  };
  const setTabletPanelRef = (index: number) => (node: HTMLElement | null) => {
    if (node) tabletPanelRefs.current[index] = node;
  };
  const setTabletItemRef = (index: number) => (node: HTMLAnchorElement | null) => {
    if (node) tabletItemRefs.current[index] = node;
  };

  useEffect(() => {
    if (shapeTimeoutRef.current) clearTimeout(shapeTimeoutRef.current);

    if (isOpen) {
      setHeaderShapeClass('rounded-[48px]');
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass('rounded-[48px]');
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) clearTimeout(shapeTimeoutRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    const minDelta = 8;
    const revealAtTop = 80;

    const handleScrollDirection = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const delta = currentScrollY - lastScrollYRef.current;
      const isDesktop = window.matchMedia('(min-width: 768px)').matches;

      if (!isDesktop || isOpen || currentScrollY < revealAtTop) {
        setIsHeaderHidden(false);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      if (Math.abs(delta) < minDelta) return;

      setIsHeaderHidden(delta > 0);
      lastScrollYRef.current = currentScrollY;
    };

    lastScrollYRef.current = window.scrollY;
    handleScrollDirection();

    window.addEventListener('scroll', handleScrollDirection, { passive: true });
    window.addEventListener('resize', handleScrollDirection);

    return () => {
      window.removeEventListener('scroll', handleScrollDirection);
      window.removeEventListener('resize', handleScrollDirection);
    };
  }, [isOpen]);

  useEffect(() => {
    const root = tabletMenuRef.current;
    const spread = tabletSpreadRef.current;
    const items = tabletItemRefs.current.filter(Boolean);
    const cta = tabletCtaRef.current;
    const button = menuButtonRef.current;
    const isTablet = window.matchMedia('(max-width: 767px)').matches;

    if (!root || !spread || !cta || !button || !isTablet) return;

    const ease = {
      in: 'cubic-bezier(0.7, 0, 0.84, 0)',
      soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
    };

    const remember = (animation: Animation) => {
      tabletAnimationsRef.current.add(animation);
      animation.addEventListener('finish', () => tabletAnimationsRef.current.delete(animation), { once: true });
      animation.addEventListener('cancel', () => tabletAnimationsRef.current.delete(animation), { once: true });
      return animation.finished.catch(() => {});
    };

    const cancelRunning = () => {
      tabletAnimationsRef.current.forEach((animation) => {
        try {
          animation.commitStyles();
        } catch {
          // Some browsers do not support commitStyles for every animation.
        }
        animation.cancel();
      });
      tabletAnimationsRef.current.clear();
    };

    const animateTo = (node: HTMLElement, keyframes: Keyframe[], options: KeyframeAnimationOptions) =>
      remember(node.animate(keyframes, { fill: 'forwards', easing: ease.soft, ...options }));

    const getSpreadGeometry = () => {
      const rect = button.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const radius = Math.ceil(Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))) + 72;

      return { x, y, radius };
    };

    const setSpreadGeometry = ({ x, y, radius }: ReturnType<typeof getSpreadGeometry>) => {
      root.style.setProperty('--menu-origin-x', `${x}px`);
      root.style.setProperty('--menu-origin-y', `${y}px`);
      root.style.setProperty('--menu-spread-size', `${radius * 2}px`);
    };

    const setSpreadScale = (scale: number) => {
      spread.style.transform = `translate(-50%, -50%) scale(${scale})`;
    };

    const setContentVisible = (visible: boolean) => {
      [...items, cta].forEach((node) => {
        node.style.opacity = visible ? '1' : '0';
        node.style.transform = 'none';
      });
    };

    const resetClosed = () => {
      const geometry = getSpreadGeometry();
      root.setAttribute('aria-hidden', 'true');
      root.style.visibility = 'hidden';
      root.style.pointerEvents = 'none';
      setSpreadGeometry(geometry);
      setSpreadScale(0);
      setContentVisible(false);
      tabletPhaseRef.current = 'closed';
    };

    const showMenu = () => {
      root.setAttribute('aria-hidden', 'false');
      root.style.visibility = 'visible';
      root.style.pointerEvents = 'auto';
    };

    const openTabletMenu = async () => {
      const run = ++tabletCycleRef.current;
      cancelRunning();
      const geometry = getSpreadGeometry();
      setSpreadGeometry(geometry);
      setSpreadScale(0);
      setContentVisible(false);
      showMenu();
      tabletPhaseRef.current = 'opening';

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setSpreadScale(1);
        setContentVisible(true);
        tabletPhaseRef.current = 'open';
        return;
      }

      const spreadDuration = 560;
      const contentRevealDelay = spreadDuration * 0.2;

      await Promise.all([
        animateTo(spread, [{ transform: 'translate(-50%, -50%) scale(0)' }, { transform: 'translate(-50%, -50%) scale(1)' }], {
          duration: spreadDuration,
          easing: ease.soft,
        }),
        ...[...items, cta].map((node) =>
          animateTo(node, [{ opacity: 0 }, { opacity: 1 }], {
            delay: contentRevealDelay,
            duration: 220,
            easing: ease.soft,
          }),
        ),
      ]);
      setSpreadScale(1);

      if (tabletCycleRef.current === run) tabletPhaseRef.current = 'open';
    };

    const closeTabletMenu = async () => {
      const run = ++tabletCycleRef.current;
      cancelRunning();
      tabletPhaseRef.current = 'exiting';
      const geometry = getSpreadGeometry();
      setSpreadGeometry(geometry);

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        resetClosed();
        return;
      }

      const spreadCloseDuration = 360;
      const contentHideDelay = spreadCloseDuration * 0.5;

      await Promise.all([
        animateTo(spread, [{ transform: 'translate(-50%, -50%) scale(1)' }, { transform: 'translate(-50%, -50%) scale(0)' }], {
          duration: spreadCloseDuration,
          easing: ease.in,
        }),
        ...[...items, cta].map((node) =>
          animateTo(node, [{ opacity: getComputedStyle(node).opacity }, { opacity: 0 }], {
            delay: contentHideDelay,
            duration: 140,
            easing: ease.in,
          }),
        ),
      ]);

      if (tabletCycleRef.current === run) resetClosed();
    };

    if (isOpen) {
      openTabletMenu();
    } else if (tabletPhaseRef.current === 'closed') {
      resetClosed();
    } else {
      closeTabletMenu();
    }

    return cancelRunning;
  }, [isOpen, links.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !isOpen) return;
      setIsOpen(false);
      menuButtonRef.current?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
    <header
      className={`sign-flow-header ${projectDetailRouteClass} ${isHeaderHidden ? 'sign-flow-header-hidden' : ''} fixed left-1/2 top-6 z-[70] flex w-[calc(100%-2rem)] -translate-x-1/2 flex-col items-center px-8 py-4 text-white transition-all duration-300 ease-in-out md:left-0 md:top-0 md:w-full md:translate-x-0 md:px-0 md:py-8 ${headerShapeClass}`}>
      <div className="sign-flow-header-inner relative z-10 flex w-full items-center justify-between gap-x-8 md:mx-auto md:max-w-[1280px] md:px-8">
        <Link
          ref={desktopLogoRef}
          to="/"
          onClick={handleNavigation('/', closeMenu)}
          onPointerMove={(event) => updateMagneticDock(event.currentTarget, event, 'logo-dock', desktopNavMagneticOptions)}
          onPointerLeave={(event) => resetDock(event.currentTarget, 'logo-dock')}
          className="sign-flow-logo-link sign-flow-desktop-logo hidden items-center md:flex"
        >
          <img src={logo} alt={logoAlt} className="h-[48px] w-auto object-contain" />
        </Link>

        <nav className="sign-flow-desktop-nav hidden items-center space-x-5 md:ml-auto md:flex md:space-x-12">
          {links.map(link => (
            <AnimatedNavLink
              key={link.href}
              href={link.href}
              onClick={handleNavigation(link.href)}
            >
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <button
          ref={menuButtonRef}
          className={`sign-flow-menu-button ml-auto flex h-[46px] w-[46px] items-center justify-center rounded-full border transition active:scale-95 focus:outline-none md:hidden ${
            isOpen
              ? 'border-white bg-white text-black'
              : isMenuButtonOnLight
                ? 'border-black/75 bg-transparent text-black'
                : 'border-white/75 bg-transparent text-white'
          }`}
          onClick={toggleMenu}
          aria-label={isOpen ? 'Close Menu' : 'Open Menu'}
          type="button">
          <ArrowUpRight className={`h-6 w-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} strokeWidth={2.2} />
        </button>
      </div>
    </header>

    <div
      ref={tabletMenuRef}
      className={`sign-flow-tablet-menu ${projectDetailRouteClass} fixed inset-0 z-[60] overflow-hidden text-white md:hidden ${
        isOpen ? '' : 'pointer-events-none'
      }`}
      aria-hidden={!isOpen}
      onClick={closeMenu}
    >
      <div ref={tabletSpreadRef} className="sign-flow-tablet-spread" aria-hidden="true" />
      <aside
        ref={setTabletPanelRef(0)}
        className="sign-flow-tablet-panel sign-flow-tablet-menu-card bg-[#111111]"
        aria-label="Tablet menu"
        onClick={(event) => event.stopPropagation()}
      >
        <nav className="flex flex-col items-start gap-16">
          {links.map((link, index) => (
            <Link
              ref={setTabletItemRef(index)}
              key={link.href}
              to={link.href}
              onClick={handleMenuNavigation(link.href, closeMenu)}
              className={`sign-flow-tablet-link text-[32px] font-medium capitalize leading-none tracking-[-0.0em] ${isActiveHref(link.href) ? 'is-active' : ''}`}
            >
              {link.label.toLowerCase()}
            </Link>
          ))}
        </nav>
      </aside>
      <aside
        ref={setTabletPanelRef(1)}
        className="sign-flow-tablet-panel sign-flow-tablet-project-card"
        aria-label="Project shortcut"
        onClick={(event) => event.stopPropagation()}
      >
        <Link
          ref={tabletCtaRef}
          to="/portfolio"
          onClick={handleMenuNavigation('/portfolio', closeMenu)}
          className="sign-flow-tablet-cta flex h-20 w-full items-center justify-between rounded-[18px] bg-white px-7 font-semibold capitalize tracking-[-0.0em] text-black"
        >
          <span className="!text-[20px] leading-none">projects</span>
          <ArrowUpRight className="h-9 w-9" />
        </Link>
      </aside>
    </div>
    </>
  );
}
