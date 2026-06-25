
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tag } from 'lucide-react';
import GradualBlur from '@/components/GradualBlur';
import { ButtonColorful } from '@/components/ui/button-colorful';
import { projects, type Project } from '@/data/projects';
import { runCirclePageTransition } from '@/lib/pageTransition';
import { preloadProjectDetailResources } from '@/lib/routePreload';
import { publicAsset } from '@/lib/utils';
import './PortfolioPage.css';

const PortfolioPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [filter, setFilter] = useState('All');
  const isProjectTransitioningRef = useRef(false);
  const filterDockRef = useRef<HTMLDivElement | null>(null);
  const filterItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const filterDockFrameRef = useRef<number | null>(null);

  const categories = ['All', 'Mobile Design', 'Web Design', 'Data visualization', 'Motion Effect Design'];
  const allPrioritySlugs = [
    'personnel-logistics-management-system',
    'human-resources-management-system',
    'petro-mesh-international-dmcc',
  ];

  const filteredProjects = filter === 'All' ?
  [...projects].sort((a, b) => {
    const aIndex = allPrioritySlugs.indexOf(a.slug);
    const bIndex = allPrioritySlugs.indexOf(b.slug);

    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  }) :
  projects.filter((project) => (project.tags ?? [project.category]).includes(filter));
  const getProjectTags = (project: Project) => project.tags ?? [project.category];

  useEffect(() => {
    const restoreScrollY = (location.state as { restoreScrollY?: number } | null)?.restoreScrollY;
    if (typeof restoreScrollY !== 'number') return;

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: restoreScrollY, left: 0, behavior: 'auto' });
    });
  }, [location.state]);

  const animateProjectNavigation = (project: Project, triggerElement?: HTMLElement, clickPoint?: { x: number; y: number }) => {
    if (isProjectTransitioningRef.current) return;

    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    const returnScrollY = window.scrollY || window.pageYOffset || 0;
    window.sessionStorage.setItem(
      'xulei-project-return',
      JSON.stringify({ slug: project.slug, returnTo, returnScrollY, timestamp: Date.now() }),
    );

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      navigate(`/portfolio/${project.slug}`, { state: { returnTo, returnScrollY } });
      return;
    }

    isProjectTransitioningRef.current = true;

    runCirclePageTransition({
      originX: clickPoint?.x,
      originY: clickPoint?.y,
      fallbackElement: triggerElement,
      onCovered: () => navigate(`/portfolio/${project.slug}`, { state: { fromPortfolioTransition: true, returnTo, returnScrollY } }),
      preload: () => preloadProjectDetailResources(project),
      onFinish: () => {
        isProjectTransitioningRef.current = false;
      },
    });
  };

  const openProject = (project: Project, triggerElement?: HTMLElement, clickPoint?: { x: number; y: number }) => {
    animateProjectNavigation(project, triggerElement, clickPoint);
  };

  const setFilterItemRef = (index: number) => (node: HTMLButtonElement | null) => {
    filterItemRefs.current[index] = node;
  };

  const resetProjectImageDock = (node: HTMLElement) => {
    node.style.setProperty('--project-image-dock-x', '0px');
    node.style.setProperty('--project-image-dock-y', '0px');
    node.style.setProperty('--project-image-dock-scale', '1');
  };

  const resetProjectCtaDock = (node: HTMLElement) => {
    node.style.setProperty('--project-cta-dock-x', '0px');
    node.style.setProperty('--project-cta-dock-y', '0px');
    node.style.setProperty('--project-cta-dock-scale', '1');
  };

  const handleProjectImagePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const node = event.currentTarget;
    const rect = node.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY);
    const bound = Math.max(rect.width, rect.height) * 0.72;
    const proximity = Math.max(0, 1 - distance / bound);
    const x = (deltaX / rect.width) * 16 * proximity;
    const y = (deltaY / rect.height) * 14 * proximity;
    const scale = 1 + 0.065 * proximity;

    node.style.setProperty('--project-image-dock-x', `${x.toFixed(2)}px`);
    node.style.setProperty('--project-image-dock-y', `${y.toFixed(2)}px`);
    node.style.setProperty('--project-image-dock-scale', scale.toFixed(3));
  };

  const handleProjectCtaPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const node = event.currentTarget;
    const rect = node.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY);
    const bound = Math.max(rect.width, rect.height) * 1.25;
    const proximity = Math.max(0, 1 - distance / bound);
    const x = (deltaX / rect.width) * 20 * proximity;
    const y = (deltaY / rect.height) * 11 * proximity;
    const scale = 1 + 0.085 * proximity;

    node.style.setProperty('--project-cta-dock-x', `${x.toFixed(2)}px`);
    node.style.setProperty('--project-cta-dock-y', `${y.toFixed(2)}px`);
    node.style.setProperty('--project-cta-dock-scale', scale.toFixed(3));
  };

  useEffect(() => {
    const dock = filterDockRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    if (!dock) return;

    const setDockState = (node: HTMLButtonElement, x: number, scale: number) => {
      node.style.setProperty('--filter-dock-x', `${x.toFixed(2)}px`);
      node.style.setProperty('--filter-dock-scale', scale.toFixed(3));
    };

    const resetFilters = () => {
      if (filterDockFrameRef.current !== null) {
        window.cancelAnimationFrame(filterDockFrameRef.current);
        filterDockFrameRef.current = null;
      }

      filterItemRefs.current.forEach((node) => {
        if (node) setDockState(node, 0, 1);
      });
    };

    const updateFilters = (pointerX: number) => {
      const bound = 150;
      const maxScale = 1.18;
      const maxShift = 12;

      filterItemRefs.current.forEach((node) => {
        if (!node) return;

        const rect = node.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const distance = center - pointerX;
        const absDistance = Math.abs(distance);

        if (absDistance >= bound) {
          setDockState(node, 0, 1);
          return;
        }

        const phase = (absDistance / bound) * (Math.PI / 2);
        const proximity = Math.cos(phase);
        const direction = distance === 0 ? 0 : distance / absDistance;
        const scale = 1 + (maxScale - 1) * proximity;
        const x = direction * maxShift * Math.sin(phase);

        setDockState(node, x, scale);
      });
    };

    let pointerX = 0;
    const handlePointerMove = (event: PointerEvent) => {
      if (reduceMotion.matches || !finePointer.matches) {
        resetFilters();
        return;
      }

      pointerX = event.clientX;
      if (filterDockFrameRef.current !== null) return;

      filterDockFrameRef.current = window.requestAnimationFrame(() => {
        filterDockFrameRef.current = null;
        updateFilters(pointerX);
      });
    };

    dock.addEventListener('pointermove', handlePointerMove);
    dock.addEventListener('pointerleave', resetFilters);
    window.addEventListener('resize', resetFilters);

    return () => {
      dock.removeEventListener('pointermove', handlePointerMove);
      dock.removeEventListener('pointerleave', resetFilters);
      window.removeEventListener('resize', resetFilters);
      resetFilters();
    };
  }, [categories.length]);

  return (
    <div className="relative overflow-hidden pt-16 bg-black">
      <GradualBlur
        target="page"
        position="top"
        height="7rem"
        strength={2.5}
        divCount={6}
        curve="bezier"
        exponential
        opacity={1}
        style={{ zIndex: 55 }}
      />
      <img
        className="portfolio-spotlight-right"
        src={publicAsset('/effects/contact-spotlight-right.png')}
        alt=""
        aria-hidden="true"
      />
      <div className="relative z-10">
      {/* Hero Section */}
      <section className="text-white pb-8 pt-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>

            <h1 className="mb-0 text-5xl">
              <span className="text-5xl font-semibold text-white">Design</span>
              <span className="text-5xl font-light text-white">Portfolio</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-4 lg:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-x-auto border-b border-white/20 pb-8 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-auto md:w-4/5 lg:w-full [&::-webkit-scrollbar]:hidden lg:pb-10">
            <div ref={filterDockRef} className="flex w-max flex-nowrap items-center gap-5 lg:gap-8">
              {categories.map((category, categoryIndex) => (
                <React.Fragment key={category}>
                  <button
                    ref={setFilterItemRef(categoryIndex)}
                    onClick={() => setFilter(category)}
                    className={`portfolio-filter-dock-item shrink-0 whitespace-nowrap text-[16px] font-normal leading-none transition-colors duration-200 md:text-[20px] lg:text-[clamp(20px,1.25vw,24px)] ${
                      filter === category ? 'text-white' : 'text-white/25 hover:text-white/55'
                    }`}
                  >
                    {category}
                  </button>
                  {categoryIndex < categories.length - 1 && (
                    <span className="h-px w-4 shrink-0 bg-white/18 lg:w-6" aria-hidden="true" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="pb-16 pt-8 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16 md:space-y-20 lg:space-y-44">
            {filteredProjects.map((project, index) =>
            <motion.div
              key={project.title}
              data-project-card
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={`grid grid-cols-1 gap-4 items-center lg:gap-12 ${
                index % 2 === 0 ? 'lg:grid-cols-[2.6fr_2fr]' : 'lg:grid-cols-[2fr_2.6fr]'
              }`}>

                {/* Project Images */}
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="relative">
                    {/* Desktop View */}
                    <button
                      type="button"
                      aria-label={`View ${project.title} project`}
	                      className="portfolio-project-image-dock relative mx-auto block w-full cursor-pointer text-left md:w-4/5 lg:hidden"
                      onPointerMove={handleProjectImagePointerMove}
                      onPointerLeave={(event) => resetProjectImageDock(event.currentTarget)}
                      onClick={(event) => openProject(project, event.currentTarget, { x: event.clientX, y: event.clientY })}
                    >
                      <img
                      data-project-image
                      src={publicAsset(project.images.desktop)}
                      alt={`${project.title} - Desktop view`}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="w-full rounded-lg shadow-2xl" />
                    </button>
                    <button
                      type="button"
                      aria-label={`View ${project.title} project`}
                      className="portfolio-project-image-dock relative hidden w-full cursor-pointer text-left lg:block"
                      onPointerMove={handleProjectImagePointerMove}
                      onPointerLeave={(event) => resetProjectImageDock(event.currentTarget)}
                      onClick={(event) => openProject(project, event.currentTarget, { x: event.clientX, y: event.clientY })}
                    >
                      <img
                      data-project-image
                      src={publicAsset(project.images.desktop)}
                      alt={`${project.title} - Desktop view`}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="w-full rounded-lg shadow-2xl" />
                    </button>
                    
                  </div>
                </div>

                {/* Project Details */}
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''} md:mx-auto md:w-4/5 lg:mx-0 lg:w-auto`}>
                  <div className="mb-4 hidden flex-wrap items-center gap-x-4 gap-y-2 lg:flex">
                    <Tag className="h-5 w-5 text-white mr-2" />
                    {getProjectTags(project).map((tag) => (
                      <span key={tag} className="text-white font-semibold">{tag}</span>
                    ))}
                  </div>
                  
                  <div className="mb-5 flex items-center justify-between gap-4 lg:mb-8 lg:block">
                    <h3 className="text-[22px] font-semibold text-white lg:text-3xl">{project.title}</h3>
                  </div>

                  <div className="max-w-[760px] space-y-4 lg:space-y-6">
                    <p className="hidden overflow-hidden text-white text-[16px] leading-9 lg:[display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]">
                      {project.descriptionZh}
                    </p>
                    <div className={`hidden pt-2 lg:flex lg:pt-6 ${index % 2 === 0 ? 'lg:justify-end' : 'lg:justify-start'}`}>
                      <ButtonColorful
                        type="button"
                        label="View Project"
                        className="portfolio-project-cta-dock h-12 px-6 text-sm"
                        onPointerMove={handleProjectCtaPointerMove}
                        onPointerLeave={(event) => resetProjectCtaDock(event.currentTarget)}
                        onClick={(event) => openProject(project, event.currentTarget, { x: event.clientX, y: event.clientY })}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
      </div>
    </div>);

};

export default PortfolioPage;
