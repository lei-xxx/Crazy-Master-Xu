export const HOME_SCENE_READY_EVENT = 'xulei-home-scene-ready';

const THREE_MODULE_URL = 'https://unpkg.com/three@0.164.1/build/three.module.js';
let threeModulePromise: Promise<Record<string, unknown>> | null = null;

export const preloadHomeSceneModule = () => {
  if (!threeModulePromise) {
    threeModulePromise = (import(/* @vite-ignore */ THREE_MODULE_URL) as Promise<Record<string, unknown>>).catch((error) => {
      threeModulePromise = null;
      throw error;
    });
  }

  return threeModulePromise;
};

export const isHomeSceneReady = () =>
  document.documentElement.dataset.xuleiHomeSceneReady === 'true';

export const markHomeSceneReady = () => {
  document.documentElement.dataset.xuleiHomeSceneReady = 'true';
  window.dispatchEvent(new CustomEvent(HOME_SCENE_READY_EVENT));
};

export const resetHomeSceneReady = () => {
  delete document.documentElement.dataset.xuleiHomeSceneReady;
};
