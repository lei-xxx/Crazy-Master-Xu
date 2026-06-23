import { RefObject, useEffect, useState } from 'react';

const getLuminance = (red: number, green: number, blue: number) => (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

const parseColorLuminance = (color: string) => {
  const colorMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/);
  if (!colorMatch) return null;

  const alpha = colorMatch[4] === undefined ? 1 : Number(colorMatch[4]);
  if (alpha <= 0.05) return null;

  return getLuminance(Number(colorMatch[1]), Number(colorMatch[2]), Number(colorMatch[3]));
};

const sampleImageLuminance = (image: HTMLImageElement, viewportX: number, viewportY: number) => {
  if (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) return null;

  const rect = image.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;

  const style = window.getComputedStyle(image);
  const objectFit = style.objectFit || 'fill';
  let renderedWidth = rect.width;
  let renderedHeight = rect.height;
  let offsetX = 0;
  let offsetY = 0;

  if (objectFit === 'contain' || objectFit === 'cover') {
    const rectRatio = rect.width / rect.height;
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const shouldFitWidth = objectFit === 'contain' ? imageRatio > rectRatio : imageRatio < rectRatio;

    if (shouldFitWidth) {
      renderedWidth = rect.width;
      renderedHeight = rect.width / imageRatio;
      offsetY = (rect.height - renderedHeight) / 2;
    } else {
      renderedHeight = rect.height;
      renderedWidth = rect.height * imageRatio;
      offsetX = (rect.width - renderedWidth) / 2;
    }
  }

  const localX = viewportX - rect.left - offsetX;
  const localY = viewportY - rect.top - offsetY;
  if (localX < 0 || localY < 0 || localX > renderedWidth || localY > renderedHeight) return null;

  const sourceX = Math.min(image.naturalWidth - 1, Math.max(0, Math.floor((localX / renderedWidth) * image.naturalWidth)));
  const sourceY = Math.min(image.naturalHeight - 1, Math.max(0, Math.floor((localY / renderedHeight) * image.naturalHeight)));

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return null;

    context.drawImage(image, sourceX, sourceY, 1, 1, 0, 0, 1, 1);
    const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
    if (alpha <= 13) return null;
    return getLuminance(red, green, blue);
  } catch {
    return null;
  }
};

export const useAdaptiveButtonTone = <T extends HTMLElement>(ref: RefObject<T>, enabled = true) => {
  const [isOnLight, setIsOnLight] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const updateButtonTone = () => {
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      element.style.visibility = 'hidden';
      const elements = document.elementsFromPoint(centerX, centerY);
      element.style.visibility = '';

      let sampledLuminance: number | null = null;

      for (const target of elements) {
        const htmlElement = target as HTMLElement;
        if (htmlElement === element || htmlElement.closest('header') || htmlElement.closest('.gradual-blur')) {
          continue;
        }

        if (htmlElement instanceof HTMLImageElement) {
          sampledLuminance = sampleImageLuminance(htmlElement, centerX, centerY);
          if (sampledLuminance !== null) break;
        }

        const backgroundLuminance = parseColorLuminance(window.getComputedStyle(htmlElement).backgroundColor);
        if (backgroundLuminance !== null) {
          sampledLuminance = backgroundLuminance;
          break;
        }
      }

      if (sampledLuminance !== null) {
        setIsOnLight(sampledLuminance > 0.58);
      }
    };

    let frameId = 0;
    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateButtonTone);
    };

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [enabled, ref]);

  return isOnLight;
};
