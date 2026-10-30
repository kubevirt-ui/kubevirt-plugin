import VmWizardNavigationComponent from '@/components/vm-wizard/vm-wizard-navigation-component';
import { WIZARD_STORY } from '@component-deps/stories/wizard-scene-constants';
import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Tears down the React tree mounted by the gallery harness (`window.unmount`).
 * Called before each story mount and after each test so stories do not leak state.
 */
const unmountGallery = async (page: Page): Promise<void> => {
  await page.evaluate(async () => {
    if (window.unmount) {
      await window.unmount();
    }
  });
};

/**
 * Mounts a gallery story by id and returns a wizard page object scoped to the story root.
 *
 * @param mount - Playwright component-scenes `mount` fixture (drives `window.mount`).
 * @param page - Browser page hosting the gallery.
 * @param storyId - Catalog story id (see `wizard-scene-constants` / `*.scene.tsx` paths).
 */
const mountVmWizardScene = async (
  mount: (storyId: string) => Promise<ReturnType<Page['locator']>>,
  page: Page,
  storyId: string,
): Promise<VmWizardNavigationComponent> => {
  await unmountGallery(page);
  const root = await mount(storyId);
  return new VmWizardNavigationComponent(page, root);
};

type SceneComponentFixtures = {
  /** Gallery story id; override per spec with `test.use({ vmWizardStory: '...' })`. */
  vmWizardStory: string;
  /** VM creation wizard PO rooted at the mounted story (`#root` subtree). */
  vmWizard: VmWizardNavigationComponent;
};

/**
 * Playwright fixture for VM wizard **component-scenes** specs.
 *
 * Mounts the default wizard shell story, asserts no `pageerror` during mount, and unmounts after each test.
 * Specs should import `test` / `expect` from this module (not `@playwright/test` directly).
 */
export const test = base.extend<SceneComponentFixtures>({
  vmWizardStory: [WIZARD_STORY, { option: true }],

  vmWizard: async ({ mount, page, vmWizardStory }, use) => {
    const pageErrors: string[] = [];
    const onPageError = (error: Error) => pageErrors.push(error.message);
    page.on('pageerror', onPageError);

    const wizard = await mountVmWizardScene(mount, page, vmWizardStory);
    expect(pageErrors, `Runtime errors: ${pageErrors.join(' | ')}`).toEqual([]);

    await use(wizard);

    page.off('pageerror', onPageError);
    await unmountGallery(page);
  },
});

export { expect };
