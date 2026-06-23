import { useEffect, useRef, useState } from 'react'
import { usePageTransitionNavigation } from '@/lib/usePageTransitionNavigation'
import './HomeNav.css'

interface HomeNavProps {
  logo: string
  logoAlt?: string
}

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Portfolio', href: '/portfolio/' },
  { label: 'Contact', href: '/contact/' },
]

function setDockState(node: HTMLElement, prefix: string, x: number, y: number, scale: number) {
  node.style.setProperty(`--${prefix}-x`, `${x.toFixed(2)}px`)
  node.style.setProperty(`--${prefix}-y`, `${y.toFixed(2)}px`)
  node.style.setProperty(`--${prefix}-scale`, scale.toFixed(3))
}

function resetDock(node: HTMLElement, prefix: string) {
  setDockState(node, prefix, 0, 0, 1)
}

function updateMagneticDock(
  node: HTMLElement,
  event: PointerEvent,
  prefix: string,
  options = { bound: 3.95, x: 10, y: 10, scale: 0.28 },
) {
  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !window.matchMedia('(hover: hover) and (pointer: fine)').matches
  ) {
    resetDock(node, prefix)
    return
  }

  const rect = node.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const deltaX = event.clientX - centerX
  const deltaY = event.clientY - centerY
  const distance = Math.hypot(deltaX, deltaY)
  const bound = Math.max(rect.width, rect.height) * options.bound
  const proximity = Math.max(0, 1 - distance / bound)
  const x = (deltaX / rect.width) * options.x * proximity
  const y = (deltaY / rect.height) * options.y * proximity
  const scale = 1 + options.scale * proximity

  setDockState(node, prefix, x, y, scale)
}

export default function HomeNav({ logo, logoAlt = 'Xu Lei' }: HomeNavProps) {
  const [isHidden, setIsHidden] = useState(false)
  const navigateWithTransition = usePageTransitionNavigation()
  const logoRef = useRef<HTMLAnchorElement | null>(null)
  const linkRefs = useRef<HTMLAnchorElement[]>([])
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    const currentLogo = logoRef.current
    const currentLinks = linkRefs.current.filter(Boolean)
    if (!currentLogo) return

    const handleLogoPointerMove = (event: PointerEvent) => {
      updateMagneticDock(currentLogo, event, 'logo-dock')
    }
    const handleLogoPointerLeave = () => resetDock(currentLogo, 'logo-dock')

    currentLogo.addEventListener('pointermove', handleLogoPointerMove)
    currentLogo.addEventListener('pointerleave', handleLogoPointerLeave)

    const cleanups = currentLinks.map((link) => {
      const handlePointerMove = (event: PointerEvent) => {
        updateMagneticDock(link, event, 'nav-link-dock')
      }
      const handlePointerLeave = () => resetDock(link, 'nav-link-dock')

      link.addEventListener('pointermove', handlePointerMove)
      link.addEventListener('pointerleave', handlePointerLeave)

      return () => {
        link.removeEventListener('pointermove', handlePointerMove)
        link.removeEventListener('pointerleave', handlePointerLeave)
      }
    })

    return () => {
      currentLogo.removeEventListener('pointermove', handleLogoPointerMove)
      currentLogo.removeEventListener('pointerleave', handleLogoPointerLeave)
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = Math.max(window.scrollY, 0)
      const delta = currentScrollY - lastScrollYRef.current

      if (currentScrollY < 80) {
        setIsHidden(false)
        lastScrollYRef.current = currentScrollY
        return
      }

      if (Math.abs(delta) >= 8) {
        setIsHidden(delta > 0)
        lastScrollYRef.current = currentScrollY
      }
    }

    lastScrollYRef.current = window.scrollY
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <header className={`home-site-nav ${isHidden ? 'is-hidden' : ''}`} aria-label="Primary navigation">
      <div className="home-site-nav-inner">
        <a
          ref={logoRef}
          className="home-site-logo"
          href="/"
          aria-label="Xu Lei Home"
          onClick={(event) => navigateWithTransition(event, '/')}
        >
          <img src={logo} alt={logoAlt} />
        </a>
        <nav className="home-site-nav-links" aria-label="Desktop navigation">
          {navLinks.map((link, index) => (
            <a
              key={link.href}
              ref={(node) => {
                if (node) linkRefs.current[index] = node
              }}
              className="home-site-nav-link"
              href={link.href}
              onClick={(event) => navigateWithTransition(event, link.href)}
            >
              <span className="home-site-nav-track">
                <span className="home-site-nav-line">{link.label}</span>
                <span className="home-site-nav-line">{link.label}</span>
              </span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
