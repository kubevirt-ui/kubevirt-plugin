import { expect, Page } from '@playwright/test';

import { SECOND } from './constants';
import { env } from './env';
import { byTestId } from './locators';
import { urls } from './urls';

const { testNamespace: NS } = env;

/** Direct-URL navigation helpers — bypass the sidebar for reliability. */
export const goto = {
  bootableVolumes: (page: Page, ns?: string) => page.goto(urls.bootableVolumes(ns)),
  checkups: (page: Page) => page.goto(urls.checkups()),
  instanceTypes: (page: Page) => page.goto(urls.instanceTypes()),
  migrationPolicies: (page: Page) => page.goto(urls.migrationPolicies()),
  networking: (page: Page, ns?: string) => page.goto(urls.networking(ns)),
  settings: (page: Page) => page.goto(urls.settings()),
  storageClasses: (page: Page) => page.goto(urls.storageClasses()),
  templates: (page: Page, ns?: string) => page.goto(urls.templates(ns)),
  vms: (page: Page, ns?: string) => page.goto(urls.vms(ns ?? NS)),
};

/** Switch the URL namespace segment without a full reload. */
export async function switchNamespace(page: Page, ns: string) {
  const current = page.url();
  const url = new URL(current);
  const newPath = url.pathname.replace(/\/k8s\/(ns\/[^/]+|all-namespaces)\//, `/k8s/ns/${ns}/`);
  await page.evaluate(
    ({ path }: { path: string }) => {
      localStorage.setItem('showEmptyProjects', 'show');
      window.history.pushState(null, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    },
    { path: newPath + url.search + url.hash },
  );
  await page.waitForTimeout(1.5 * SECOND);
}

/** Navigate to a VM detail page and wait for the h1 heading. */
export async function openVMDetails(page: Page, vmName: string, ns = NS) {
  await goto.vms(page, ns);
  await byTestId(page, vmName).click();
  await expect(page.locator('h1').getByText(vmName)).toBeVisible({ timeout: 30 * SECOND });
}

/** Navigate to a tab by clicking its horizontal-link. */
export async function goToTab(page: Page, tabName: string) {
  const link = byTestId(page, `horizontal-link-${tabName}`);
  await expect(link).toBeVisible({ timeout: 30 * SECOND });
  await link.click();
}

/** Navigate to a Configuration sub-tab. */
export async function goToConfigSubTab(page: Page, subTabId: string) {
  await goToTab(page, 'Configuration');
  const sub = byTestId(page, `vm-configuration-${subTabId}`);
  await expect(sub).toBeVisible();
  await sub.click();
}

/** Navigate to a Diagnostics sub-tab. */
export async function goToDiagnosticsSubTab(page: Page, subTabId: string) {
  await goToTab(page, 'Diagnostics');
  const sub = byTestId(page, `vm-diagnostics-${subTabId}`);
  await expect(sub).toBeVisible();
  await sub.click();
}
