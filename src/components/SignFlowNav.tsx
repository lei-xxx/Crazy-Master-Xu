import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useAdaptiveButtonTone } from '@/lib/useAdaptiveButtonTone';
import { usePageTransitionNavigation } from '@/lib/usePageTransitionNavigation';
import './SignFlowNav.css';

interface NavLinkItem {
  label: string;
  href: string;
}

interface SignFlowNavProps {
  logo: string;
  logoAlt?: string;
  links: NavLinkItem[];
}

const AnimatedNavLink = ({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) => (
  <Link
    to={href}
    onClick={onClick}
    className="sign-flow-nav-link relative inline-flex items-center text-[18px]">
    <span className="sign-flow-nav-track">
      <span className="sign-flow-nav-line text-gray-300">{children}</span>
      <span className="sign-flow-nav-line text-white">{children}</span>
    </span>
  </Link>
);

export default function SignFlowNav({ logo, logoAlt = 'Logo', links }: SignFlowNavProps) {
  const location = useLocation();
  const navigateWithTransition = usePageTransitionNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState('rounded-[48px]');
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const desktopLogoRef = useRef<HTMLAnchorElement | null>(null);
  const desktopLogoFrameRef = useRef<number | null>(null);
  const tabletMenuRef = useRef<HTMLDivElement | null>(null);
  const tabletPanelRefs = useRef<HTMLElement[]>([]);
  const tabletItemRefs = useRef<HTMLAnchorElement[]>([]);
  const tabletCtaRef = useRef<HTMLAnchorElement | null>(null);
  const tabletAnimationsRef = useRef<Set<Animation>>(new Set());
  const tabletPhaseRef = useRef<'closed' | 'opening' | 'open' | 'reversing' | 'exiting'>('closed');
  const tabletCycleRef = useRef(0);
  const shapeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollYRef = useRef(0);
  const isNavButtonOnLight = useAdaptiveButtonTone(menuButtonRef, typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches);

  const closeMenu = () => setIsOpen(false);
  const isActiveLink = (href: string) => {
    if (href === '/portfolio') return location.pathname === '/portfolio' || location.pathname.startsWith('/portfolio/');
    return location.pathname === href;
  };

  const toggleMenu = () => {
    setIsOpen(current => !current);
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
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

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
    const logo = desktopLogoRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktopQuery = window.matchMedia('(min-width: 1024px)');

    if (!logo) return;

    const setDockState = (x: number, y: number, scale: number) => {
      logo.style.setProperty('--logo-dock-x', `${x.toFixed(2)}px`);
      logo.style.setProperty('--logo-dock-y', `${y.toFixed(2)}px`);
      logo.style.setProperty('--logo-dock-scale', scale.toFixed(3));
    };

    const resetLogo = () => {
      if (desktopLogoFrameRef.current !== null) {
        window.cancelAnimationFrame(desktopLogoFrameRef.current);
        desktopLogoFrameRef.current = null;
      }

      setDockState(0, 0, 1);
    };

    const updateLogo = (pointerX: number, pointerY: number) => {
      const bound = 190;
      const maxScale = 1.28;
      const maxShift = 10;
      const rect = logo.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = pointerX - centerX;
      const distanceY = pointerY - centerY;
      const distance = Math.hypot(distanceX, distanceY);

      if (distance >= bound) {
        setDockState(0, 0, 1);
        return;
      }

      const phase = (distance / bound) * (Math.PI / 2);
      const proximity = Math.cos(phase);
      const scale = 1 + (maxScale - 1) * proximity;
      const directionX = distance === 0 ? 0 : distanceX / distance;
      const directionY = distance === 0 ? 0 : distanceY / distance;

      setDockState(directionX * maxShift * proximity, directionY * maxShift * proximity, scale);
    };

    let pointerX = 0;
    let pointerY = 0;
    const handlePointerMove = (event: PointerEvent) => {
      if (!desktopQuery.matches || reduceMotion.matches) {
        resetLogo();
        return;
      }

      pointerX = event.clientX;
      pointerY = event.clientY;
      if (desktopLogoFrameRef.current !== null) return;

      desktopLogoFrameRef.current = window.requestAnimationFrame(() => {
        desktopLogoFrameRef.current = null;
        updateLogo(pointerX, pointerY);
      });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', resetLogo);
    window.addEventListener('resize', resetLogo);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', resetLogo);
      window.removeEventListener('resize', resetLogo);
      resetLogo();
    };
  }, []);

  useEffect(() => {
    const root = tabletMenuRef.current;
    const panels = tabletPanelRefs.current.filter(Boolean);
    const items = tabletItemRefs.current.filter(Boolean);
    const cta = tabletCtaRef.current;
    const isTablet = window.matchMedia('(max-width: 1023px)').matches;

    if (!root || !cta || panels.length === 0 || !isTablet) return;

    const ease = {
      back: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
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

    const resetClosed = () => {
      root.setAttribute('aria-hidden', 'true');
      root.style.visibility = 'hidden';
      root.style.pointerEvents = 'none';
      panels.forEach((panel) => {
        panel.style.opacity = '1';
        panel.style.transform = 'translate3d(110%, 0, 0) rotate(0deg)';
      });
      items.forEach((item) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-18px)';
      });
      cta.style.opacity = '0';
      cta.style.transform = 'translateY(8px)';
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
      showMenu();
      tabletPhaseRef.current = 'opening';

      await Promise.all([
        ...panels.map((panel, index) =>
          animateTo(panel, [{ transform: getComputedStyle(panel).transform }, { transform: 'translate3d(0%, 0, 0) rotate(0deg)' }], {
            duration: 660,
            delay: index * 90,
            easing: ease.back,
          }),
        ),
        ...items.map((item, index) =>
          animateTo(item, [{ opacity: 0, transform: 'translateX(-18px)' }, { opacity: 1, transform: 'translateX(0)' }], {
            duration: 720,
            delay: 150 + index * 36,
          }),
        ),
        animateTo(cta, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], {
          duration: 360,
          delay: 430,
        }),
      ]);

      if (tabletCycleRef.current === run) tabletPhaseRef.current = 'open';
    };

    const closeTabletMenu = async () => {
      const run = ++tabletCycleRef.current;
      const reversing = tabletPhaseRef.current === 'opening';
      cancelRunning();
      tabletPhaseRef.current = reversing ? 'reversing' : 'exiting';

      await Promise.all([
        ...[...panels].reverse().map((panel, index) =>
          animateTo(panel, [{ transform: getComputedStyle(panel).transform }, {
            transform: reversing ? 'translate3d(110%, 0, 0) rotate(0deg)' : `translate3d(${index % 2 === 0 ? -8 : 10}px, 112vh, 0) rotate(${index % 2 === 0 ? -16 : 18}deg)`,
          }], {
            duration: reversing ? 430 : 520,
            delay: index * (reversing ? 26 : 46),
            easing: ease.in,
          }),
        ),
        ...items.map((item) =>
          animateTo(item, [{ opacity: getComputedStyle(item).opacity, transform: getComputedStyle(item).transform }, { opacity: 0, transform: 'translateX(-18px)' }], {
            duration: 200,
            easing: ease.in,
          }),
        ),
        animateTo(cta, [{ opacity: getComputedStyle(cta).opacity, transform: getComputedStyle(cta).transform }, { opacity: 0, transform: 'translateY(8px)' }], {
          duration: 160,
          easing: ease.in,
        }),
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
      className={`sign-flow-header ${isHeaderHidden ? 'sign-flow-header-hidden' : ''} fixed left-1/2 top-6 z-[70] flex w-[calc(100%-2rem)] -translate-x-1/2 flex-col items-center px-8 py-4 text-white transition-all duration-300 ease-in-out lg:left-0 lg:top-0 lg:w-full lg:translate-x-0 lg:px-0 lg:py-8 ${headerShapeClass}`}>
      <div className="relative z-10 flex w-full items-center justify-between gap-x-8 lg:mx-auto lg:max-w-[1280px] lg:px-8">
        <Link
          ref={desktopLogoRef}
          to="/"
          onClick={(event) => navigateWithTransition(event, '/', { beforeNavigate: closeMenu })}
          className="sign-flow-logo-link hidden items-center lg:flex"
        >
          <img src={logo} alt={logoAlt} className="h-[48px] w-auto object-contain" />
        </Link>

        <nav className="hidden items-center space-x-5 lg:ml-auto lg:flex lg:space-x-12">
          {links.map(link => (
            <AnimatedNavLink
              key={link.href}
              href={link.href}
              onClick={(event) => navigateWithTransition(event, link.href)}
            >
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <button
          ref={menuButtonRef}
          className={`ml-auto flex h-[46px] w-[46px] items-center justify-center rounded-full border transition active:scale-95 focus:outline-none md:h-[55px] md:w-[55px] lg:hidden ${
            isOpen
              ? 'border-white bg-white text-black'
              : isNavButtonOnLight
                ? 'border-black/75 bg-transparent text-black'
                : 'border-white/75 bg-transparent text-white'
          }`}
          onClick={toggleMenu}
          aria-label={isOpen ? 'Close Menu' : 'Open Menu'}
          type="button">
          <ArrowUpRight className={`h-6 w-6 transition-transform duration-300 md:h-7 md:w-7 ${isOpen ? 'rotate-[360deg]' : 'rotate-180'}`} strokeWidth={2.2} />
        </button>
      </div>
    </header>

    <div
      ref={tabletMenuRef}
      className={`sign-flow-tablet-menu fixed inset-0 z-[60] overflow-hidden text-white lg:hidden ${
        isOpen ? '' : 'pointer-events-none'
      }`}
      aria-hidden={!isOpen}
      onClick={closeMenu}
    >
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
              onClick={(event) => navigateWithTransition(event, link.href, { beforeNavigate: closeMenu })}
              className={`sign-flow-tablet-link text-[32px] font-medium capitalize leading-none tracking-[-0.0em] ${
                isActiveLink(link.href) ? 'text-white' : 'text-white/45'
              }`}
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
          onClick={(event) => navigateWithTransition(event, '/portfolio', { beforeNavigate: closeMenu })}
          className="sign-flow-tablet-cta flex h-20 w-full items-center justify-between rounded-[18px] bg-[#FF5825] px-7 font-semibold capitalize tracking-[-0.0em] text-white shadow-[0_24px_70px_rgba(255,88,37,0.25)]"
        >
          <span className="!text-[20px] leading-none">projects</span>
          <ArrowUpRight className="h-9 w-9" />
        </Link>
      </aside>
    </div>
    </>
  );
}
