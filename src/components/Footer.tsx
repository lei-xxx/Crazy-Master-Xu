
import React from 'react';
import { Link } from 'react-router-dom';
import {ExternalLink, Mail, Phone, MapPin} from 'lucide-react';
import { usePageTransitionNavigation } from '@/lib/usePageTransitionNavigation';

const Footer = () => {
  const navigateWithTransition = usePageTransitionNavigation();

  return (
    <footer className="relative z-10 bg-transparent text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-medium mb-8">Crazy Master Xu</h3>
            <p className="text-white/60 mb-8 max-w-md font-light">
              Welcome to my portfolio website of design works, let's explore the stories of inspiration through creation together.
            </p>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-white mr-3" />
                <span className="text-white/60 font-light">xuleixulei2021@qq.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-white mr-3" />
                <span className="text-white/60 font-light">18406593255</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-white mr-3" />
                <span className="text-white/60 font-light">China, Shenzhen</span>
              </div>
              <a
                href="https://www.zcool.com.cn/u/24205250"
                target="_blank"
                rel="noreferrer"
                className="flex items-center text-white/60 font-light transition-colors hover:text-white"
              >
                <ExternalLink className="h-5 w-5 text-white mr-3" />
                <span>zcool.com.cn/u/24205250</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="hidden lg:block">
            <h4 className="text-lg font-medium mb-8">Quick Links</h4>
            <ul className="space-y-8">
              <li>
                <Link
                  to="/"
                  onClick={(event) => navigateWithTransition(event, '/')}
                  className="text-white/60 font-light hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  onClick={(event) => navigateWithTransition(event, '/contact')}
                  className="text-white/60 font-light hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/portfolio"
                  onClick={(event) => navigateWithTransition(event, '/portfolio')}
                  className="text-white/60 font-light hover:text-white transition-colors"
                >
                  Portfolio
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="hidden lg:block">
            <h4 className="text-lg font-medium mb-8">Services</h4>
            <ul className="space-y-8">
              <li>
                <span className="text-white/60 font-light">Full-stack UI/UX design (app, web, data visualization)</span>
              </li>
              <li>
                <span className="text-white/60 font-light">B-end complex system design</span>
              </li>
              <li>
                <span className="text-white/60 font-light">Motion Effect Design</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col lg:flex-row justify-between items-center">
          <p className="text-white/60 text-sm font-light mb-4 lg:mb-0">
            © 2026 Crazy Master Xu. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              to="/privacy"
              onClick={(event) => navigateWithTransition(event, '/privacy')}
              className="text-white/60 font-light hover:text-white text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              onClick={(event) => navigateWithTransition(event, '/terms')}
              className="text-white/60 font-light hover:text-white text-sm transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
