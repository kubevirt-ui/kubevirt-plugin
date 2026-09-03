/**
 * Auto-Applied Labels — Test Helpers
 *
 * API-level helpers for managing the kubevirt-ui-features ConfigMap
 * during auto-applied labels E2E tests. Also provides navigation
 * helpers for settings and wizard pages.
 */

import type RequestContextClient from '@/clients/request-context-client';
import type { TestUtilsType } from '@/fixtures/test-utils';
import type SettingsPage from '@/page-objects/settings/settings-page';
import type VmCreationWizardPage from '@/page-objects/vm-wizard/vm-creation-wizard-page';
import type VmTreePage from '@/page-objects/vm/vm-tree-page';

export const FEATURES_CONFIG_MAP = 'kubevirt-ui-features';
export const USER_SETTINGS_CONFIG_MAP = 'kubevirt-user-settings';

/** Overwrites the autoAppliedLabels field in the features ConfigMap for setup and cleanup. */
export async function setAutoAppliedLabels(
  apiClient: RequestContextClient,
  utils: TestUtilsType,
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

/** Reads and parses the autoAppliedLabels array from the features ConfigMap. */
export async function getAutoLabelsFromConfigMap(
  apiClient: RequestContextClient,
  utils: TestUtilsType,
): Promise<unknown[]> {
  const configMap = await apiClient.getConfigMap(
    FEATURES_CONFIG_MAP,
    utils.EnvVariables.cnvNamespace,
  );
  const configMapData = configMap?.data as Record<string, string> | undefined;
  return JSON.parse(configMapData?.autoAppliedLabels || '[]');
}

/** Navigates to Admin Settings and expands the Auto-Applied Labels section. */
export async function expandAdminAutoLabelsSection(settingsPage: SettingsPage): Promise<void> {
  await settingsPage.navigateToSettingsViaSidebar();
  const toggle = settingsPage.page.locator('#auto-applied-labels--toggle');
  const visible = await toggle
    .waitFor({ state: 'visible', timeout: 10000 })
    .then(() => true)
    .catch(() => false);

  if (!visible) {
    await settingsPage.page.goto('/k8s/all-namespaces/virtualization-settings/cluster');
    await toggle.waitFor({ state: 'visible', timeout: 15000 });
  }

  const content = settingsPage.page.locator('#auto-applied-labels--content');
  const alreadyExpanded = await content.isVisible().catch(() => false);
  if (!alreadyExpanded) {
    await toggle.click();
    await content.waitFor({ state: 'visible', timeout: 5000 });
  }
}

/** Navigates to User Settings and expands the Default VM Labels section. */
export async function navigateToUserLabelsSection(settingsPage: SettingsPage): Promise<void> {
  await settingsPage.navigateToSettingsViaSidebar();
  const userTab = settingsPage.page.locator('button[role="tab"]:has-text("User")');
  const tabVisible = await userTab
    .waitFor({ state: 'visible', timeout: 10000 })
    .then(() => true)
    .catch(() => false);

  if (!tabVisible) {
    await settingsPage.page.goto('/k8s/all-namespaces/virtualization-settings/user');
  } else {
    await userTab.click();
  }

  const toggle = settingsPage.page.locator('#default-vm-labels--toggle');
  await toggle.waitFor({ state: 'visible', timeout: 15000 });

  const content = settingsPage.page.locator('#default-vm-labels--content');
  const alreadyExpanded = await content.isVisible().catch(() => false);
  if (!alreadyExpanded) {
    await toggle.click();
    await content.waitFor({ state: 'visible', timeout: 5000 });
  }
}

/** Navigates through the VM creation wizard to the Customization step. Returns the VM name. */
export async function navigateToWizardCustomizationStep(
  vmTreePage: VmTreePage,
  vmWizardPage: VmCreationWizardPage,
  namespace: string,
): Promise<string> {
  await vmTreePage.switchToVirtualizationPerspective();
  await vmTreePage.navigateToProjectVmListViaUI(namespace);
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

/** Fetches a VM's metadata labels as a flat record. */
export async function getVmLabels(
  apiClient: RequestContextClient,
  namespace: string,
  vmName: string,
): Promise<Record<string, string>> {
  const vm = await apiClient.getVirtualMachine(namespace, vmName);
  return (vm?.metadata?.labels || {}) as Record<string, string>;
}

/** Fetches the user's defaultVMLabels value for a given key from user-settings ConfigMap. */
export async function getUserSettingsLabelValue(
  apiClient: RequestContextClient,
  utils: TestUtilsType,
  labelKey: string,
): Promise<string | undefined> {
  const configMap = await apiClient.getConfigMap(
    USER_SETTINGS_CONFIG_MAP,
    utils.EnvVariables.cnvNamespace,
  );
  const configMapData = configMap?.data as Record<string, string> | undefined;
  const userData = JSON.parse(
    configMapData?.['kube-admin'] || configMapData?.['kubeadmin'] || '{}',
  );
  return userData?.defaultVMLabels?.[labelKey];
}
