import '@patternfly/react-core/dist/styles/base.css';

import { StrictMode, type ComponentType } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';

import { initStoryI18n } from '../stories/i18n';

import {
  galleryIndexPath,
  isGalleryIndexPath,
  storyIdFromPathname,
  storyRoutePath,
} from './gallery-routes';
import GalleryIndex from './GalleryIndex';
import { listStoryIds, resolveStory } from './story-catalog';

initStoryI18n();

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Gallery page is missing #root');
}

let root: Root | undefined;
/** Bumps when a story mounts so a slow `showIndex()` cannot overwrite it. */
let galleryRenderGeneration = 0;
let activeStoryId: string | undefined;

const ensureRoot = (): Root => {
  root ??= createRoot(rootEl);
  return root;
};

const syncStoryUrl = (storyId: string | undefined): void => {
  const nextPath = storyId ? storyRoutePath(storyId) : galleryIndexPath();
  if (window.location.pathname !== nextPath) {
    window.history.pushState({ storyId }, '', nextPath);
  }
};

const renderStory = (
  Story: ComponentType<Record<string, unknown>>,
  props: Record<string, unknown>,
) => {
  flushSync(() => {
    ensureRoot().render(
      <StrictMode>
        <Story {...props} />
      </StrictMode>,
    );
  });
};

const showIndex = async (): Promise<void> => {
  const generation = ++galleryRenderGeneration;
  activeStoryId = undefined;
  syncStoryUrl(undefined);
  const storyIds = await listStoryIds();
  if (generation !== galleryRenderGeneration) {
    return;
  }
  flushSync(() => {
    ensureRoot().render(
      <StrictMode>
        <GalleryIndex
          storyIds={storyIds}
          onSelectStory={(storyId) => {
            void window.mount({ story: storyId });
          }}
        />
      </StrictMode>,
    );
  });
};

const mountStoryById = async (
  story: string,
  props: Record<string, unknown> = {},
): Promise<void> => {
  galleryRenderGeneration++;
  activeStoryId = story;
  syncStoryUrl(story);
  const Story = await resolveStory(story);
  if (!Story) {
    throw new Error(`Unknown story: ${story}`);
  }
  renderStory(Story, props);
};

window.mount = async ({ story, props = {} }) => {
  await mountStoryById(story, props);
};

window.unmount = async () => {
  root?.unmount();
  root = undefined;
  activeStoryId = undefined;
  await showIndex();
};

const bootstrapFromLocation = (): void => {
  const storyFromUrl = storyIdFromPathname(window.location.pathname);
  if (storyFromUrl) {
    void mountStoryById(storyFromUrl).catch(() => {
      void showIndex();
    });
    return;
  }
  if (isGalleryIndexPath(window.location.pathname)) {
    void showIndex();
    return;
  }
  void showIndex();
};

window.addEventListener('popstate', () => {
  const storyFromUrl = storyIdFromPathname(window.location.pathname);
  if (storyFromUrl && storyFromUrl !== activeStoryId) {
    void mountStoryById(storyFromUrl);
    return;
  }
  if (isGalleryIndexPath(window.location.pathname) && activeStoryId) {
    void showIndex();
  }
});

bootstrapFromLocation();
