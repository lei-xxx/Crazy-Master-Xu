import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import { usePageTransitionNavigation } from '@/lib/usePageTransitionNavigation';

const Footer = () => {
  const navigateWithTransition = usePageTransitionNavigation();

  return (
    <footer className="site-footer" aria-label="Footer">
      <div className="site-footer-inner">
        <section>
          <h3 className="site-footer-title">Crazy Master Xu</h3>
          <p className="site-footer-copy">
            Welcome to my portfolio website of design works, let's explore the stories of inspiration through creation together.
          </p>
          <div className="site-footer-contact">
            <div className="site-footer-contact-item">
              <Mail className="site-footer-icon" aria-hidden="true" />
              <span>xuleixulei2021@qq.com</span>
            </div>
            <div className="site-footer-contact-item">
              <Phone className="site-footer-icon" aria-hidden="true" />
              <span>18406593255</span>
            </div>
            <div className="site-footer-contact-item">
              <MapPin className="site-footer-icon" aria-hidden="true" />
              <span>China, Shenzhen</span>
            </div>
            <a className="site-footer-link" href="https://www.zcool.com.cn/u/24205250" target="_blank" rel="noreferrer">
              <ExternalLink className="site-footer-icon" aria-hidden="true" />
              <span>zcool.com.cn/u/24205250</span>
            </a>
          </div>
        </section>

        <nav aria-label="Quick links">
          <h4 className="site-footer-heading">Quick Links</h4>
          <ul className="site-footer-list">
            <li><Link className="site-footer-link" to="/" onClick={(event) => navigateWithTransition(event, '/')}>Home</Link></li>
            <li><Link className="site-footer-link" to="/contact" onClick={(event) => navigateWithTransition(event, '/contact')}>Contact</Link></li>
            <li><Link className="site-footer-link" to="/portfolio" onClick={(event) => navigateWithTransition(event, '/portfolio')}>Portfolio</Link></li>
          </ul>
        </nav>

        <section>
          <h4 className="site-footer-heading">Services</h4>
          <ul className="site-footer-list">
            <li><span className="site-footer-service">Full-stack UI/UX design (app, web, data visualization)</span></li>
            <li><span className="site-footer-service">B-end complex system design</span></li>
            <li><span className="site-footer-service">Motion Effect Design</span></li>
          </ul>
        </section>
      </div>

      <div className="site-footer-rule" />
      <div className="site-footer-bottom">
        <span>© 2026 Crazy Master Xu. All rights reserved.</span>
        <div className="site-footer-legal">
          <Link className="site-footer-link" to="/privacy" onClick={(event) => navigateWithTransition(event, '/privacy')}>Privacy Policy</Link>
          <Link className="site-footer-link" to="/terms" onClick={(event) => navigateWithTransition(event, '/terms')}>Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
