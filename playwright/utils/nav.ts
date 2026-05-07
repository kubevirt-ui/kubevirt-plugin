import { expect, Page } from '@playwright/test';

import { env } from './env';
import { byTestId } from './locators';

const { cnvNamespace: CNV_NS, testNamespace: NS } = env;

/** Direct-URL navigation helpers — bypass the sidebar for reliability. */
export const goto = {
  bootableVolumes: (page: Page, ns?: string) =>
    page.goto(
      `/k8s/${ns ? `ns/${ns}` : `ns/${env.osImagesNamespace}`}/cdi.kubevirt.io~v1beta1~DataSource`,
    ),

  checkups: (page: Page) => page.goto(`/k8s/ns/${CNV_NS}/virtualization-checkups`),

  instanceTypes: (page: Page) =>
    page.goto(`/k8s/cluster/instancetype.kubevirt.io~v1beta1~VirtualMachineClusterInstancetype`),

  migrationPolicies: (page: Page) =>
    page.goto(`/k8s/cluster/migrations.kubevirt.io~v1alpha1~MigrationPolicy`),

  networking: (page: Page, ns?: string) =>
    page.goto(
      `/k8s/${ns ? `ns/${ns}` : 'all-namespaces'}/k8s.cni.cncf.io~v1~NetworkAttachmentDefinition`,
    ),

  settings: (page: Page) => page.goto(`/k8s/ns/${CNV_NS}/virtualization-settings`),

  storageClasses: (page: Page) => page.goto(`/k8s/cluster/storage.k8s.io~v1~StorageClass`),

  templates: (page: Page, ns?: string) =>
    page.goto(`/k8s/${ns ? `ns/${ns}` : 'all-namespaces'}/templates.openshift.io~v1~Template`),

  vms: (page: Page, ns = NS) =>
    page.goto(`/k8s/${ns ? `ns/${ns}` : 'all-namespaces'}/kubevirt.io~v1~VirtualMachine`),
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
  await page.waitForTimeout(1500);
}

/** Navigate to a VM detail page and wait for the h1 heading. */
export async function openVMDetails(page: Page, vmName: string, ns = NS) {
  await goto.vms(page, ns);
  await byTestId(page, vmName).click();
  await expect(page.locator('h1').getByText(vmName)).toBeVisible({ timeout: 30_000 });
}

/** Navigate to a tab by clicking its horizontal-link. */
export async function goToTab(page: Page, tabName: string) {
  const link = byTestId(page, `horizontal-link-${tabName}`);
  await expect(link).toBeVisible({ timeout: 30_000 });
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
