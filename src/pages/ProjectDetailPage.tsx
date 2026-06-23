import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, FileText, Play } from 'lucide-react';
import GradualBlur from '@/components/GradualBlur';
import { projects } from '@/data/projects';
import { runCirclePageTransition } from '@/lib/pageTransition';
import { useAdaptiveButtonTone } from '@/lib/useAdaptiveButtonTone';
import { closeShellRoute, isInsideShellFrame, publicAsset } from '@/lib/utils';

type ProjectDetailPageProps = {
  initialSlug?: string;
};

type ProjectReturnState = {
  fromPortfolioTransition?: boolean;
  returnTo?: string;
  returnScrollY?: number;
};

const PROJECT_RETURN_KEY = 'xulei-project-return';
const PENDING_SCROLL_RESTORE_KEY = 'xulei-pending-scroll-restore';

const readStoredReturnState = (slug?: string): ProjectReturnState | null => {
  if (typeof window === 'undefined' || !slug) return null;

  try {
    const rawValue = window.sessionStorage.getItem(PROJECT_RETURN_KEY);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as ProjectReturnState & { slug?: string; timestamp?: number };
    if (parsed.slug !== slug) return null;
    if (parsed.timestamp && Date.now() - parsed.timestamp > 30 * 60 * 1000) return null;

    return parsed;
  } catch {
    return null;
  }
};

const writePendingScrollRestore = (returnTo: string, scrollY?: number) => {
  if (typeof window === 'undefined' || typeof scrollY !== 'number') return;

  window.sessionStorage.setItem(
    PENDING_SCROLL_RESTORE_KEY,
    JSON.stringify({ returnTo, scrollY, timestamp: Date.now() }),
  );
};

const ProjectDetailPage = ({ initialSlug }: ProjectDetailPageProps) => {
  const { slug: routeSlug } = useParams();
  const slug = routeSlug ?? initialSlug;
  const location = useLocation();
  const navigate = useNavigate();
  const project = projects.find((item) => item.slug === slug);
  const isBackTransitioningRef = useRef(false);
  const backButtonRef = useRef<HTMLButtonElement | null>(null);
  const isBackButtonOnLight = useAdaptiveButtonTone(backButtonRef, typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches);
  const navigationState = (location.state as ProjectReturnState | null) ?? null;
  const storedReturnState = readStoredReturnState(slug);
  const isEnteringFromPortfolio = Boolean(navigationState?.fromPortfolioTransition);

  if (!project) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black pt-28 text-white">
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
        <motion.main
          initial={isEnteringFromPortfolio ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: isEnteringFromPortfolio ? 0.18 : 0 }}
          className="relative z-10 mx-auto max-w-3xl px-5 py-20 text-center"
        >
          <h1 className="text-3xl font-semibold">Project not found</h1>
          <Link
            to="/portfolio"
            aria-label="Back to Portfolio"
            className="mt-8 inline-flex h-14 w-24 items-center justify-center rounded-full bg-white text-black transition hover:bg-white/90"
          >
            <ChevronLeft className="h-8 w-8 stroke-[3]" />
          </Link>
        </motion.main>
      </div>
    );
  }

  const projectTags = Array.from(new Set(project.tags ?? [project.category]));
  const goBack = (triggerElement?: HTMLElement, clickPoint?: { x: number; y: number }) => {
    const historyIndex = window.history.state?.idx;
    const returnTo = navigationState?.returnTo ?? storedReturnState?.returnTo;
    const returnScrollY = navigationState?.returnScrollY ?? storedReturnState?.returnScrollY;
    const usesDocumentNavigation = Boolean(returnTo && !returnTo.startsWith('/portfolio'));
    const navigateBack = () => {
      if (returnTo) {
        window.sessionStorage.removeItem(PROJECT_RETURN_KEY);

        if (returnTo.startsWith('/portfolio')) {
          navigate(returnTo, { state: { restoreScrollY: returnScrollY } });
          return;
        }

        writePendingScrollRestore(returnTo, returnScrollY);
        if (isInsideShellFrame()) {
          closeShellRoute(returnTo);
          return;
        }

        window.location.assign(returnTo);
        return;
      }

      if (typeof historyIndex === 'number' && historyIndex > 0) {
        navigate(-1);
        return;
      }

      navigate('/portfolio');
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      navigateBack();
      return;
    }

    if (isBackTransitioningRef.current) return;
    isBackTransitioningRef.current = true;

    runCirclePageTransition({
      originX: clickPoint?.x,
      originY: clickPoint?.y,
      fallbackElement: triggerElement,
      onCovered: navigateBack,
      holdAfterCovered: usesDocumentNavigation,
      onFinish: () => {
        isBackTransitioningRef.current = false;
      },
    });
  };

  return (
    <div className="project-detail-page relative min-h-screen overflow-hidden bg-black text-white">
      <button
        ref={backButtonRef}
        type="button"
        onClick={(event) => goBack(event.currentTarget, { x: event.clientX, y: event.clientY })}
        className={`fixed right-[106px] top-10 z-[80] inline-flex h-[46px] min-w-[90px] items-center justify-center rounded-full border bg-transparent px-6 text-[13px] font-semibold uppercase tracking-[0.04em] transition active:scale-95 md:right-[120px] md:h-[55px] md:min-w-[112px] md:px-8 md:text-[15px] lg:hidden ${
          isBackButtonOnLight ? 'border-black/75 text-black' : 'border-white/55 text-white'
        }`}
        aria-label="Back"
      >
        Back
      </button>
      <button
        type="button"
        onClick={(event) => goBack(event.currentTarget, { x: event.clientX, y: event.clientY })}
        className="fixed left-8 top-10 z-[80] hidden h-[56px] min-w-[132px] items-center justify-center rounded-full border border-white/18 bg-black/15 px-9 text-[15px] font-semibold uppercase tracking-[0.04em] text-white shadow-[0_18px_48px_rgba(0,0,0,0.28)] backdrop-blur-[10px] transition hover:border-white/36 hover:bg-white/[0.06] active:scale-95 lg:inline-flex"
        aria-label="Back"
      >
        Back
      </button>
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
      <motion.main
        initial={isEnteringFromPortfolio ? { opacity: 0, y: 10 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: isEnteringFromPortfolio ? 0.18 : 0 }}
        className="relative z-10 pb-20"
      >
        <section className="border-b border-white/10 bg-transparent pb-16 pt-32 text-white lg:pb-24 lg:pt-44 xl:pt-48">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 xl:max-w-[1480px]">
            <div className="max-w-[980px]">
              <h1 className="text-[40px] font-medium leading-[0.95] tracking-normal text-white md:text-[58px] lg:text-[72px]">
                {project.title}
              </h1>
            </div>

            <div className="mt-20 flex flex-wrap items-center gap-4 lg:mt-28">
              {projectTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex h-11 items-center rounded-full border border-white/40 bg-transparent px-7 !text-[18px] font-semibold leading-none text-white"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-10 max-w-[760px] lg:mt-12">
              <p className="!text-[18px] font-medium leading-[1.7] tracking-normal text-white md:!text-[20px]">
                {project.descriptionZh}
              </p>
            </div>
          </div>
        </section>

        <section
          id="project-gallery"
          className="mx-auto max-w-5xl scroll-mt-20 space-y-2 px-4 pt-2 sm:px-6 lg:px-8 xl:max-w-[1480px]"
        >
          {project.media.map((media, mediaIndex) => (
            <article
              key={`${media.type}-${media.src}`}
              className="overflow-hidden bg-transparent"
            >
              {media.type === 'image' ? (
                <img
                  src={publicAsset(media.src)}
                  alt={media.alt || media.title || project.title}
                  loading={mediaIndex === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full object-contain"
                />
              ) : media.type === 'video' ? (
                <video
                  src={publicAsset(media.src)}
                  poster={publicAsset(media.poster)}
                  title={media.title || project.title}
                  controls
                  playsInline
                  className="w-full bg-black"
                />
              ) : media.type === 'pdf' ? (
                <iframe
                  src={publicAsset(media.src)}
                  title={media.title || `${project.title} PDF`}
                  className="h-[80vh] w-full bg-white"
                />
              ) : (
                <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                  {media.type === 'video' ? (
                    <Play className="mb-4 h-10 w-10 text-white/40" />
                  ) : (
                    <FileText className="mb-4 h-10 w-10 text-white/40" />
                  )}
                  <p className="text-sm text-white/50">Media unavailable</p>
                </div>
              )}
            </article>
          ))}
        </section>
      </motion.main>
    </div>
  );
};

export default ProjectDetailPage;
