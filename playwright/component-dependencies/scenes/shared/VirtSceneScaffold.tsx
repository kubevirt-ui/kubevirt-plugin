import type { JSX, ReactNode } from 'react';

import i18n from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router';

import { StoryFormProvider } from '../../stories/decorators';
import { initStoryI18n } from '../../stories/i18n';
import type { GallerySceneDataPreset } from '../../stories/gallery-scene-data';

import { GalleryDataInitializer } from './GalleryDataInitializer';

type VirtSceneScaffoldProps = {
  children: ReactNode;
  initialEntries: string[];
  initialPreset?: GallerySceneDataPreset;
};

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
