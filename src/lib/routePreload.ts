import { projects, type Project } from '@/data/projects';
import { preloadHomeSceneModule } from '@/lib/homeScenePreload';
import { publicAsset, toRouterPath } from '@/lib/utils';

const IMAGE_PRELOAD_TIMEOUT_MS = 1400;
const DEFAULT_DETAIL_IMAGE_LIMIT = 4;
const preloadedImages = new Set<string>();

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const resolveAsset = (source?: string) => {
  if (!source) return undefined;
  return publicAsset(source) ?? source;
};

const preloadImage = async (source?: string) => {
  if (typeof window === 'undefined') return;

  const resolvedSource = resolveAsset(source);
  if (!resolvedSource || preloadedImages.has(resolvedSource)) return;

  preloadedImages.add(resolvedSource);

  await new Promise<void>((resolve) => {
    const image = new Image();
    const finish = () => resolve();

    image.decoding = 'async';
    image.loading = 'eager';
    image.onload = finish;
    image.onerror = finish;
    image.src = resolvedSource;

    if (image.complete) {
      if (typeof image.decode === 'function') {
        image.decode().then(finish).catch(finish);
        return;
      }

      finish();
    }
  });
};

const preloadImages = async (sources: Array<string | undefined>, limit = DEFAULT_DETAIL_IMAGE_LIMIT) => {
  const uniqueSources = Array.from(new Set(sources.filter(Boolean))).slice(0, limit) as string[];
  if (!uniqueSources.length) return;

  await Promise.race([
    Promise.allSettled(uniqueSources.map((source) => preloadImage(source))),
    wait(IMAGE_PRELOAD_TIMEOUT_MS),
  ]);
};

const getProjectDetailSources = (project: Project) => {
  const firstMediaSources = project.media
    .slice(0, 2)
    .map((media) => (media.type === 'video' ? media.poster : media.src));

  return [
    project.cover,
    project.images.desktop,
    project.images.mobile,
    ...firstMediaSources,
  ];
};

export const preloadProjectDetailResources = (project: Project) =>
  preloadImages(getProjectDetailSources(project), DEFAULT_DETAIL_IMAGE_LIMIT);

const getRoutePath = (to: string) => {
  const normalizedPath = toRouterPath(to) ?? to;
  return normalizedPath.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
};

export const preloadRouteResources = async (to: string) => {
  if (typeof window === 'undefined') return;
  if (/^(https?:)?\/\//.test(to) || to.startsWith('mailto:') || to.startsWith('tel:')) return;

  const routePath = getRoutePath(to);

  if (routePath === '/') {
    await Promise.allSettled([
      preloadHomeSceneModule(),
      preloadImages(['/transition-assets/xulei-transition.png'], 1),
    ]);
    return;
  }

  if (routePath === '/portfolio') {
    await preloadImages(projects.map((project) => project.cover || project.images.desktop), 6);
    return;
  }

  const projectMatch = routePath.match(/^\/portfolio\/([^/]+)$/);
  if (projectMatch) {
    const slug = decodeURIComponent(projectMatch[1]);
    const project = projects.find((item) => item.slug === slug);
    if (project) {
      await preloadProjectDetailResources(project);
    }
  }
};
