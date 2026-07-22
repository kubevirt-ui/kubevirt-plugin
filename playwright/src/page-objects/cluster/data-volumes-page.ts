/**
 * Page object for the DataVolumes list page.
 * Handles DataVolume creation, navigation, and verification.
 */

import type { Page } from '@playwright/test';

import BasePage from '../base-page';

export default class DataVolumesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  override async clickCreateAndSelectOption(option: 'With form' | 'With YAML'): Promise<void> {
    const optionSelectors = {
      'With form': 'button[role="menuitem"]:has-text("With form")',
      'With YAML': 'button[role="menuitem"]:has-text("With YAML")',
    };
    await super.clickCreateAndSelectOption(this.testId('item-create'), optionSelectors[option]);
  }

  async navigateToAllNamespacesDataVolumes(): Promise<void> {
    await this.goTo('/k8s/all-namespaces/cdi.kubevirt.io~v1beta1~DataVolume');
  }

  async navigateToProjectDataVolumes(projectName: string): Promise<void> {
    await this.goTo(`/k8s/ns/${projectName}/cdi.kubevirt.io~v1beta1~DataVolume`);
  }

  async verifyDataVolumeDoesNotExist(volumeName: string, timeout = 60000): Promise<boolean> {
    try {
      const volumeRow = this.locator(`tr:has-text("${volumeName}")`);
      const volumeExists = await volumeRow.isVisible({ timeout }).catch(() => false);
      return !volumeExists;
    } catch {
      return true; // If we can't find it, that's what we want
    }
  }

  override async verifyPageLoaded(
    indicatorSelectors: string[] = [],
    includeCreateButton = true,
    timeout = 10000,
  ): Promise<boolean> {
    return await super.verifyPageLoaded(indicatorSelectors, includeCreateButton, timeout);
  }
}
