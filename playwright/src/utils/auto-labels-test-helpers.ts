/**
 * Auto-Applied Labels — Test Helpers
 */

import type RequestContextClient from '@/clients/request-context-client';
import type { wizardTestUtils } from '@/fixtures/create-vm-fixture';
import type WizardVmNavigationPage from '@/page-objects/vm/wizard-vm-navigation-page';
import type VmCreationWizardPage from '@/page-objects/vm-wizard/vm-creation-wizard-page';
import { NavigationPage } from '@/page-objects/navigation-page';
import type { Page } from '@playwright/test';

export type WizardTestUtils = typeof wizardTestUtils;

export const FEATURES_CONFIG_MAP = 'kubevirt-ui-features';
export const USER_SETTINGS_CONFIG_MAP = 'kubevirt-user-settings';

export async function setAutoAppliedLabels(
  apiClient: RequestContextClient,
  utils: WizardTestUtils,
  labels: unknown[],
): Promise<void> {
  await apiClient.mergePatchResource(
    '',
    'v1',
    'configmaps',
    FEATURES_CONFIG_MAP,
    { data: { autoAppliedLabels: JSON.stringify(labels) } },
    utils.EnvVariables.cnvNamespace,
  );
}

export async function getAutoLabelsFromConfigMap(
  apiClient: RequestContextClient,
  utils: WizardTestUtils,
): Promise<unknown[]> {
  const configMap = await apiClient.getConfigMap(
    FEATURES_CONFIG_MAP,
    utils.EnvVariables.cnvNamespace,
  );
  const configMapData = configMap?.data;
  return JSON.parse(configMapData?.autoAppliedLabels || '[]');
}

async function gotoVirtSettings(page: Page, segment: 'cluster' | 'user'): Promise<void> {
  const nav = new NavigationPage(page);
  await nav.goToVirtualizationSettings().catch(async () => {
    await page.goto(`/k8s/all-namespaces/virtualization-settings/${segment}`, {
      waitUntil: 'domcontentloaded',
    });
  });
}

/** Navigates to Admin Settings and expands the Auto-Applied Labels section. */
export async function expandAdminAutoLabelsSection(page: Page): Promise<void> {
  await gotoVirtSettings(page, 'cluster');
  const toggle = page.locator('#auto-applied-labels--toggle');
  await toggle.waitFor({ state: 'visible', timeout: 15000 });
  const content = page.locator('#auto-applied-labels--content');
  if (!(await content.isVisible().catch(() => false))) {
    await toggle.click();
    await content.waitFor({ state: 'visible', timeout: 5000 });
  }
}

/** Navigates to User Settings and expands the Default VM Labels section. */
export async function navigateToUserLabelsSection(page: Page): Promise<void> {
  await gotoVirtSettings(page, 'user');
  const userTab = page.locator('button[role="tab"]:has-text("User")');
  if (await userTab.isVisible().catch(() => false)) {
    await userTab.click();
  }
  const toggle = page.locator('#default-vm-labels--toggle');
  await toggle.waitFor({ state: 'visible', timeout: 15000 });
  const content = page.locator('#default-vm-labels--content');
  if (!(await content.isVisible().catch(() => false))) {
    await toggle.click();
    await content.waitFor({ state: 'visible', timeout: 5000 });
  }
}

export async function navigateToWizardCustomizationStep(
  vmListPage: WizardVmNavigationPage,
  vmWizardPage: VmCreationWizardPage,
  namespace: string,
): Promise<string> {
  await vmListPage.switchToVirtualizationPerspective();
  await vmListPage.navigateToProjectVmListViaUI(namespace);
  await vmWizardPage.openWizardFromCreateDropdown();
  await vmWizardPage.ensureVmNameFilled();
  const vmName = await vmWizardPage.page.locator('.vm-creation-wizard #vm-name').inputValue();
  await vmWizardPage.clickNext();
  await vmWizardPage.selectOperatingSystem('rhel');
  await vmWizardPage.clickNext();
  await vmWizardPage.selectFirstAvailableBootVolume();
  await vmWizardPage.clickNext();
  await vmWizardPage.waitForComputeStepReady();
  await vmWizardPage.selectInstanceTypeSeries('u');
  await vmWizardPage.selectComputeSize('medium');
  await vmWizardPage.clickNextWhenEnabled();
  await vmWizardPage.waitForStepActive('Customization');

  return vmName;
}

export async function getVmLabels(
  apiClient: RequestContextClient,
  namespace: string,
  vmName: string,
): Promise<Record<string, string>> {
  const vm = await apiClient.getVirtualMachine(namespace, vmName);
  return (vm?.metadata?.labels || {}) as Record<string, string>;
}

export async function getUserSettingsLabelValue(
  apiClient: RequestContextClient,
  utils: WizardTestUtils,
  labelKey: string,
): Promise<string | undefined> {
  const configMap = await apiClient.getConfigMap(
    USER_SETTINGS_CONFIG_MAP,
    utils.EnvVariables.cnvNamespace,
  );
  const configMapData = configMap?.data;
  const userData = JSON.parse(
    configMapData?.['kube-admin'] || configMapData?.['kubeadmin'] || '{}',
  );
  return userData?.defaultVMLabels?.[labelKey];
}
