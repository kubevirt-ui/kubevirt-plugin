export const CM_FEATURES = 'kubevirt-ui-features';
export const CM_USER_SETTINGS = 'kubevirt-user-settings';

export async function patchAutoLabels(apiClient, utils, labels: unknown[]) {
  await apiClient.mergePatchResource(
    '',
    'v1',
    'configmaps',
    CM_FEATURES,
    { data: { autoAppliedLabels: JSON.stringify(labels) } },
    utils.EnvVariables.cnvNamespace,
  );
}

export async function getAutoLabelsFromConfigMap(apiClient, utils): Promise<unknown[]> {
  const cm = await apiClient.getConfigMap(CM_FEATURES, utils.EnvVariables.cnvNamespace);
  const cmData = cm?.data as Record<string, string> | undefined;
  return JSON.parse(cmData?.autoAppliedLabels || '[]');
}

export async function expandAutoLabelsSection(settingsPage) {
  await settingsPage.navigateToSettingsViaSidebar();
  const toggle = settingsPage.page.locator('#auto-applied-labels--toggle');
  await toggle.click();
}

export async function navigateToUserLabelsSection(settingsPage) {
  await settingsPage.navigateToSettingsViaSidebar();
  await settingsPage.page.locator('button[role="tab"]:has-text("User")').click();
  await settingsPage.page.waitForTimeout(1000);
  await settingsPage.page.locator('#default-vm-labels--toggle').click();
}

export async function navigateToCustomizationStep(vmTreePage, vmWizardPage, namespace: string) {
  await vmTreePage.switchToVirtualizationPerspective();
  await vmTreePage.navigateToProjectVmListViaUI(namespace);
  await vmWizardPage.openWizardFromCreateDropdown();
  await vmWizardPage.selectOperatingSystem('rhel');
  await vmWizardPage.clickNext();
  await vmWizardPage.selectFirstAvailableBootVolume();
  await vmWizardPage.clickNext();
  await vmWizardPage.clickNext();
}
