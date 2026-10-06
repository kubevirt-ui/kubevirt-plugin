import { expect, type Locator, type Page } from '@playwright/test';

import type { StoryStateExpectation } from '../../stories/story-state-expectations';

type MountFixture = (storyId: string) => Promise<ReturnType<Page['locator']>>;

/** Modals and overlays often portal outside `#root`; prefer the page for state queries. */
const stateScope = async (component: Locator, page: Page): Promise<Locator | Page> => {
  if (await page.getByRole('dialog').count()) {
    return page;
  }
  return component;
};

const assertStorySurfaceVisible = async (component: Locator, page: Page): Promise<void> => {
  const dialogOnPage = page.getByRole('dialog');
  const dialog = component.getByRole('dialog');
  const surface = component.getByTestId('story-surface');
  const visibleInRoot = component.locator(':visible');

  if (await dialogOnPage.count()) {
    await expect(dialogOnPage.first()).toBeVisible();
  } else if (await dialog.count()) {
    await expect(dialog.first()).toBeVisible();
  } else if (await visibleInRoot.count()) {
    await expect(visibleInRoot.first()).toBeVisible();
  } else if (await surface.count()) {
    await expect(surface.first()).toBeVisible();
  } else {
    await expect(component).toBeAttached();
  }
};

export const assertStoryState = async (
  component: Locator,
  page: Page,
  expectations: StoryStateExpectation[],
): Promise<void> => {
  const scope = await stateScope(component, page);

  for (const expectation of expectations) {
    switch (expectation.type) {
      case 'containsText':
        await expect(scope.getByText(expectation.text, { exact: false }).first()).toBeVisible();
        break;
      case 'dialogVisible':
        await expect(page.getByRole('dialog')).toBeVisible();
        break;
      case 'visibleTestId':
        await expect(scope.getByTestId(expectation.id)).toBeVisible();
        break;
      default:
        break;
    }
  }
};

/** Mount story, assert no runtime errors, baseline visibility, then optional state expectations. */
export const expectGalleryStoryReflectsState = async (
  mount: MountFixture,
  page: Page,
  storyId: string,
  expectations: StoryStateExpectation[] = [],
): Promise<Locator> => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.evaluate(async () => {
    if (window.unmount) {
      await window.unmount();
    }
  });

  const component = await mount(storyId);

  expect(pageErrors, `Runtime errors: ${pageErrors.join(' | ')}`).toEqual([]);

  await assertStorySurfaceVisible(component, page);
  await assertStoryState(component, page, expectations);

  return component;
};

/** @deprecated Use expectGalleryStoryReflectsState */
export const expectGalleryStoryMounts = async (
  mount: MountFixture,
  page: Page,
  storyId: string,
): Promise<void> => {
  await expectGalleryStoryReflectsState(mount, page, storyId);
};
