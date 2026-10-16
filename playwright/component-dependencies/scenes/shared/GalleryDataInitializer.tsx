import { type JSX, type ReactNode, useLayoutEffect } from 'react';

import {
  applyGallerySceneDataPreset,
  type GallerySceneDataPreset,
} from '../../stories/gallery-scene-data';

type GalleryDataInitializerProps = {
  children: ReactNode;
  initialPreset: GallerySceneDataPreset;
};

/** Seeds gallery watch registry for the mounted scene (wizard starts on `populated`). */
export const GalleryDataInitializer = ({
  children,
  initialPreset,
}: GalleryDataInitializerProps): JSX.Element => {
  useLayoutEffect(() => {
    applyGallerySceneDataPreset(initialPreset);
    return () => {
      applyGallerySceneDataPreset('empty');
    };
  }, [initialPreset]);

  return <>{children}</>;
};
