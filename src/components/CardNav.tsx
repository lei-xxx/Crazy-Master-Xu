import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import './CardNav.css';

interface CardNavLink {
  label: string;
  href: string;
  ariaLabel?: string;
}

interface CardNavItem {
  label: string;
  bgColor: string;
  textColor: string;
  links?: CardNavLink[];
}

interface CardNavProps {
  logo: string;
  logoAlt?: string;
  items: CardNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

const isInternalLink = (href: string) => href.startsWith('/');

const CardNav = ({
  logo,
  logoAlt = 'Logo',
  items,
  className = '',
  baseColor = '#fff',
  menuColor,
  buttonBgColor,
  buttonTextColor
}: CardNavProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleMenu = () => {
    setIsExpanded(current => !current);
  };

  const closeMenu = () => {
    setIsExpanded(false);
  };

  const renderLink = (link: CardNavLink, index: number) => {
    const content = (
      <>
        <ArrowUpRight className="nav-card-link-icon" aria-hidden="true" />
        {link.label}
      </>
    );

    if (isInternalLink(link.href)) {
      return (
        <Link
          key={`${link.label}-${index}`}
          className="nav-card-link"
          to={link.href}
          aria-label={link.ariaLabel}
          onClick={closeMenu}>
          {content}
        </Link>
      );
    }

    return (
      <a key={`${link.label}-${index}`} className="nav-card-link" href={link.href} aria-label={link.ariaLabel}>
        {content}
      </a>
    );
  };

  return (
    <div className={`card-nav-container ${className}`}>
      <nav className={`card-nav ${isExpanded ? 'open' : ''}`} style={{ backgroundColor: baseColor }}>
        <div className="card-nav-top">
          <button
            className={`hamburger-menu ${isExpanded ? 'open' : ''}`}
            onClick={toggleMenu}
            aria-label={isExpanded ? 'Close menu' : 'Open menu'}
            type="button"
            style={{ color: menuColor || '#000' }}>
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>

          <Link className="card-logo-container" to="/" aria-label="Home" onClick={closeMenu}>
            <img src={logo} alt={logoAlt} className="card-logo" />
            <span className="card-logo-text">Xu Lei</span>
          </Link>

          <Link
            to="/portfolio"
            className="card-nav-cta-button"
            style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
            onClick={closeMenu}>
            View Projects
          </Link>
        </div>

        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {(items || []).slice(0, 3).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card"
              style={{ backgroundColor: item.bgColor, color: item.textColor }}>
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">{item.links?.map(renderLink)}</div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CardNav;
