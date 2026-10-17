import VmWizardNavigationComponent from '@/components/vm-wizard/vm-wizard-navigation-component';
import { WIZARD_STORY } from '@component-deps/stories/wizard-scene-constants';
import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const unmountGallery = async (page: Page): Promise<void> => {
  await page.evaluate(async () => {
    if (window.unmount) {
      await window.unmount();
    }
  });
};

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
  vmWizardStory: string;
  vmWizard: VmWizardNavigationComponent;
};

/** VM wizard component scenes — mounts default story and injects VmWizardNavigationComponent. */
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
