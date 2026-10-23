import type { JSX, ReactNode } from 'react';

import i18n from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router';

import { StoryFormProvider } from '../../stories/decorators';
import { initStoryI18n } from '../../stories/i18n';
import type { GallerySceneDataPreset } from '../../stories/gallery-scene-data';

import { GalleryDataInitializer } from './GalleryDataInitializer';

/** Props for the standard virtualization component-gallery scene shell. */
type VirtSceneScaffoldProps = {
  /** Production view(s) to render inside the scaffold (usually the feature under test). */
  children: ReactNode;
  /** `MemoryRouter` entries (e.g. `['/vm-wizard']`) so hooks and routes match the flow under test. */
  initialEntries: string[];
  /**
   * Gallery watch-registry preset (`gallery-scene-data`).
   * Wizard scenes typically use `populated`; use `empty` when the UI should start with no list data.
   */
  initialPreset?: GallerySceneDataPreset;
};

/**
 * Shared wrapper for `*.scene.tsx` gallery stories.
 *
 * Provides i18n, in-memory routing, react-hook-form context (`StoryFormProvider`), and
 * stubbed K8s watch data via {@link GalleryDataInitializer}. Import this from scene shells
 * instead of re-wiring providers in each story file.
 */
export const VirtSceneScaffold = ({
  children,
  initialEntries,
  initialPreset = 'empty',
}: VirtSceneScaffoldProps): JSX.Element => {
  initStoryI18n();

  return (
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={initialEntries}>
        <StoryFormProvider>
          <GalleryDataInitializer initialPreset={initialPreset}>{children}</GalleryDataInitializer>
        </StoryFormProvider>
      </MemoryRouter>
    </I18nextProvider>
  );
};
