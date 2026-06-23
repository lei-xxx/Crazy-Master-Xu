
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {ArrowRight, Star, Users, Award, Palette, Layout, Layers, Sparkles, Globe} from 'lucide-react';
import { ShimmerButton } from '../components/ShimmerButton';
import { PaperDesignBackground } from '../components/PaperDesignBackground';
import { SplineRobotShowcase } from '../components/SplineRobotShowcase';
import GradualBlur from '@/components/GradualBlur';
import { usePageTransitionNavigation } from '@/lib/usePageTransitionNavigation';
import './HomePage.css';

const HomePage = () => {
  const navigateWithTransition = usePageTransitionNavigation();
  const [backgroundExitProgress, setBackgroundExitProgress] = useState(0);
  const [isMobileTouching, setIsMobileTouching] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isHeaderBlurVisible, setIsHeaderBlurVisible] = useState(false);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const servicesCarouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frameId = 0;

    const updateBackgroundExit = () => {
      const viewportHeight = window.innerHeight || 1;
      const nextProgress = Math.min(Math.max(window.scrollY / viewportHeight, 0), 1);
      setBackgroundExitProgress(nextProgress);
    };

    const onScroll = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateBackgroundExit);
    };

    updateBackgroundExit();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    let resumeTimer = 0;
    const mobileQuery = window.matchMedia('(max-width: 1023px)');

    const updateViewport = () => {
      setIsMobileViewport(mobileQuery.matches);
    };
    const pause = () => {
      if (!mobileQuery.matches) return;
      window.clearTimeout(resumeTimer);
      setIsMobileTouching(true);
    };

    const resume = () => {
      if (!mobileQuery.matches) return;
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => setIsMobileTouching(false), 300);
    };

    updateViewport();
    mobileQuery.addEventListener('change', updateViewport);
    window.addEventListener('touchstart', pause, { passive: true });
    window.addEventListener('touchend', resume, { passive: true });
    window.addEventListener('touchcancel', resume, { passive: true });

    return () => {
      window.clearTimeout(resumeTimer);
      mobileQuery.removeEventListener('change', updateViewport);
      window.removeEventListener('touchstart', pause);
      window.removeEventListener('touchend', resume);
      window.removeEventListener('touchcancel', resume);
    };
  }, []);

  useEffect(() => {
    let frameId = 0;
    const desktopQuery = window.matchMedia('(min-width: 1024px)');

    const updateHeaderBlur = () => {
      if (!desktopQuery.matches) {
        setIsHeaderBlurVisible(false);
        return;
      }

      const navSafeBottom = 112;
      const contentNodes = Array.from(document.querySelectorAll<HTMLElement>('[data-home-blur-content="true"]'));
      const hasContentUnderNav = contentNodes.some((node) => {
        const rect = node.getBoundingClientRect();
        return rect.top < navSafeBottom && rect.bottom > 0;
      });

      setIsHeaderBlurVisible(hasContentUnderNav);
    };

    const onScrollOrResize = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateHeaderBlur);
    };

    updateHeaderBlur();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    desktopQuery.addEventListener('change', updateHeaderBlur);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      desktopQuery.removeEventListener('change', updateHeaderBlur);
    };
  }, []);

  const services = [
    {
      name: 'UI/UX Design',
      icon: Layout,
      description: 'Shape product flows, interface systems, and interaction details that make complex ideas feel clear and usable.',
      className: 'md:col-span-2',
      accent: 'from-[#FF5825]/14 via-white/5 to-transparent'
    },
    {
      name: 'Brand Identity Design',
      icon: Sparkles,
      description: 'Build a distinctive visual language, logo system, and brand foundation that makes every touchpoint feel intentional.',
      className: '',
      accent: 'from-[#FF5825]/14 via-white/5 to-transparent'
    },
    {
      name: 'Visual Design',
      icon: Palette,
      description: 'Create campaign visuals, digital assets, and polished compositions with a sharp eye for hierarchy and emotion.',
      className: '',
      accent: 'from-[#FF5825]/14 via-white/5 to-transparent'
    },
    {
      name: 'Motion Graphics',
      icon: Layers,
      description: 'Bring stories to life with kinetic systems, launch assets, and lightweight animation concepts for modern brands.',
      className: 'md:col-span-2',
      accent: 'from-[#FF5825]/14 via-white/5 to-transparent'
    }
  ];

  useEffect(() => {
    if (!isMobileViewport) return;

    const carouselTimer = window.setInterval(() => {
      setActiveServiceIndex((currentIndex) => (currentIndex + 1) % services.length);
    }, 2800);

    return () => window.clearInterval(carouselTimer);
  }, [isMobileViewport, services.length]);

  useEffect(() => {
    if (!isMobileViewport || !servicesCarouselRef.current) return;

    const carousel = servicesCarouselRef.current;
    const activeCard = carousel.children[activeServiceIndex] as HTMLElement | undefined;
    if (!activeCard) return;

    const centeredOffset = activeCard.offsetLeft - (carousel.clientWidth - activeCard.clientWidth) / 2;
    carousel.scrollTo({
      left: Math.max(centeredOffset, 0),
      behavior: 'smooth',
    });
  }, [activeServiceIndex, isMobileViewport]);

  const resetHomeButtonDock = (node: HTMLElement) => {
    node.style.setProperty('--home-button-dock-x', '0px');
    node.style.setProperty('--home-button-dock-y', '0px');
    node.style.setProperty('--home-button-dock-scale', '1');
  };

  const handleHomeButtonPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const node = event.currentTarget;
    const rect = node.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY);
    const bound = Math.max(rect.width, rect.height) * 1.15;
    const proximity = Math.max(0, 1 - distance / bound);
    const x = (deltaX / rect.width) * 20 * proximity;
    const y = (deltaY / rect.height) * 11 * proximity;
    const scale = 1 + 0.085 * proximity;

    node.style.setProperty('--home-button-dock-x', `${x.toFixed(2)}px`);
    node.style.setProperty('--home-button-dock-y', `${y.toFixed(2)}px`);
    node.style.setProperty('--home-button-dock-scale', scale.toFixed(3));
  };

  return (
    <div className="relative overflow-x-hidden bg-black">
      <PaperDesignBackground
        className="fixed -left-2 -right-2 bottom-0 top-0 z-0 pointer-events-none origin-center lg:inset-0"
        scale={1 + backgroundExitProgress * 5}
        speed={isMobileTouching ? 0 : isMobileViewport ? 1.25 : 1}
        maxPixelCount={isMobileViewport ? 720 * 1280 : 1920 * 1080}
      />
      <GradualBlur
        target="page"
        position="top"
        height="7rem"
        width="min(1280px, calc(100vw - 4rem))"
        strength={2.5}
        divCount={6}
        curve="bezier"
        exponential
        opacity={1}
        className="hidden lg:block"
        style={{
          zIndex: 55,
          marginLeft: 'auto',
          marginRight: 'auto',
          opacity: isHeaderBlurVisible ? 1 : 0,
          transition: 'opacity 180ms ease-out',
        }}
      />
      <div className="relative z-10">
      {/* Hero Section - Black Background with Paper Design Shader */}
      <section className="text-white min-h-screen flex items-center relative overflow-hidden">
        <div className="w-full relative z-10 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="max-w-7xl mx-auto">
            <motion.div
              data-home-blur-content="true"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center">

              <h1 className="text-[2.1rem] sm:text-[2.75rem] lg:text-[4.15rem] xl:text-[5rem] font-semibold leading-tight mb-7 px-4">
                Your Next Design Inspiration
                <br className="hidden md:block" />
                {' — Xu Lei'}
              </h1>
              <p className="text-white/60 mb-9 leading-relaxed text-[15px] sm:text-[1.38rem] font-light max-w-5xl mx-auto px-4">
                Welcome to my portfolio website of design works, let's explore the stories of inspiration through creation together.
              </p>
              <div className="flex justify-center mb-2 sm:mb-3 lg:mb-4 px-4">
                <Link
                  to="/portfolio"
                  onClick={(event) => navigateWithTransition(event, '/portfolio')}
                  onPointerMove={handleHomeButtonPointerMove}
                  onPointerLeave={(event) => resetHomeButtonDock(event.currentTarget)}
                  className="home-magnetic-button border border-white bg-transparent text-white hover:bg-white hover:text-black rounded-full font-semibold transition-all duration-200 text-center px-12 h-[72px] text-xl lg:text-[1.38rem] flex items-center justify-center w-[calc(100vw-128px)] max-w-none sm:h-20 sm:w-[374px] sm:max-w-[396px] sm:px-14">
                  View Portfolio
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section data-home-blur-content="true" className="pb-4 pt-14 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 lg:mb-16">

            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6">Design Services</h2>
            <p className="text-base sm:text-lg text-white/60 max-w-4xl mx-auto">
              I specialize in creating compelling visual experiences that elevate your brand 
              and engage your audience. Every project is crafted with intention and creativity.
            </p>
          </motion.div>

          <div className="-mx-4 md:hidden">
            <div
              ref={servicesCarouselRef}
              className="flex h-[150px] gap-3 overflow-hidden px-4 [scrollbar-width:none] [touch-action:pan-y] [&::-webkit-scrollbar]:hidden"
            >
              {services.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="h-full w-[78%] shrink-0">
                    <div className="group relative h-[150px] min-h-[150px] overflow-hidden rounded-[22px] border border-white/10 bg-[#050505]/55 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.32)] backdrop-blur-md">
                      <div className={`absolute inset-0 bg-gradient-to-br ${service.accent} opacity-45`} />
                      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
                      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:36px_36px]" />

                      <div className="relative z-10 flex h-full flex-col justify-between gap-6">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-[#FF5825] shadow-[0_12px_28px_rgba(255,88,37,0.35)]">
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">
                            0{index + 1}
                          </span>
                        </div>

                        <h3 className="text-[18px] font-semibold leading-tight text-white">{service.name}</h3>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="hidden md:grid md:grid-flow-dense md:grid-cols-3 md:auto-rows-[minmax(190px,auto)] md:gap-4 lg:auto-rows-[minmax(260px,auto)] lg:gap-5">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`group relative min-h-[190px] overflow-hidden rounded-[22px] border border-white/10 bg-[#050505]/55 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.32)] backdrop-blur-md transition-all duration-500 hover:border-white/20 hover:bg-[#080808]/65 lg:min-h-[220px] lg:rounded-[28px] lg:p-7 ${service.className}`}>

                  <div className={`absolute inset-0 bg-gradient-to-br ${service.accent} opacity-45 transition-opacity duration-500 group-hover:opacity-65`} />
                  <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl transition-transform duration-500 group-hover:scale-125" />
                  <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:36px_36px]" />

                  <div className="relative z-10 flex h-full flex-col justify-between gap-5 lg:gap-8">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-[13px] border border-white/10 bg-[#FF5825] shadow-[0_12px_28px_rgba(255,88,37,0.35)] lg:h-12 lg:w-12 lg:rounded-2xl">
                        <IconComponent className="h-[18px] w-[18px] text-white lg:h-6 lg:w-6" />
                      </div>
                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/45 lg:px-3 lg:text-[11px]">
                        0{index + 1}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-[18px] font-semibold leading-tight text-white lg:text-2xl">{service.name}</h3>
                      <p className="mt-4 hidden max-w-xl text-sm leading-7 text-white/60 lg:block">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* USP Section */}
      <section data-home-blur-content="true" className="pb-12 pt-4 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}>

              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6 lg:mb-8">Why Work With Me?</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Award className="h-6 w-6 text-[#FF5825] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">7+ Years of Design Excellence</h3>
                    <p className="text-white/60 text-sm">
                      Proven track record of delivering exceptional design solutions for brands worldwide.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Star className="h-6 w-6 text-[#FF5825] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Award-Winning Creativity</h3>
                    <p className="text-white/60 text-sm">
                      Beautiful, innovative designs that captivate audiences and stand out from the crowd.
                    </p>
                  </div>
                  </div>
                <div className="flex items-start space-x-4">
                  <Globe className="h-6 w-6 text-[#FF5825] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Strategic Design Thinking</h3>
                    <p className="text-white/60 text-sm">
                      Data-driven design decisions that align with your business goals and user needs.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Users className="h-6 w-6 text-[#FF5825] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Collaborative Process</h3>
                    <p className="text-white/60 text-sm">
                      Transparent communication and close collaboration to bring your vision to life.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative order-first md:order-last">

              <SplineRobotShowcase />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section data-home-blur-content="true" className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>

            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6">
              Ready to Bring Your Vision to Life?
            </h2>
            <p className="text-base sm:text-lg text-white/60 mb-8 max-w-3xl mx-auto">
              Let's collaborate on creating stunning visual designs that perfectly capture 
              your brand essence and resonate with your audience.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                onClick={(event) => navigateWithTransition(event, '/contact')}
                onPointerMove={handleHomeButtonPointerMove}
                onPointerLeave={(event) => resetHomeButtonDock(event.currentTarget)}
                className="home-magnetic-button inline-flex w-full md:w-auto"
              >
                <ShimmerButton className="shadow-2xl rounded-full border-[#dedede] bg-[linear-gradient(110deg,#dedede,45%,#ffffff,55%,#dedede)] hover:bg-[linear-gradient(110deg,#dedede,45%,#ffffff,55%,#dedede)] transition-all duration-200 w-full text-black md:w-auto">
                  <span className="text-center text-sm leading-none font-semibold tracking-tight whitespace-pre-wrap text-black lg:text-base flex items-center justify-center">
                    Let's Collaborate
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </ShimmerButton>
              </Link>
              <Link
                to="/portfolio"
                onClick={(event) => navigateWithTransition(event, '/portfolio')}
                onPointerMove={handleHomeButtonPointerMove}
                onPointerLeave={(event) => resetHomeButtonDock(event.currentTarget)}
                className="home-magnetic-button border border-white bg-transparent text-white hover:bg-white hover:text-black px-8 h-12 flex items-center justify-center rounded-full font-semibold transition-all duration-200 text-center w-full md:w-auto">

                View My Work
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      </div>
    </div>);

};

export default HomePage;
