/**
 * Page object for the DataVolume detail page.
 * Handles DataVolume status verification and deletion.
 */

import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import BasePage from '../base-page';

export default class DataVolumeDetailPage extends BasePage {
  private readonly _deleteBtn = this.locator('button:has-text("Delete")');
  private readonly _resourceTitle = this.locator('[data-test-id="resource-title"]');

  constructor(page: Page) {
    super(page);
  }

  async deleteDataVolume(volumeName: string, deletePvc = false): Promise<boolean> {
    try {
      const actionsButton = this.locator('button:has-text("Actions")');
      const deleteButton = this._deleteBtn;
      const pvcCheckbox = this.locator('input[id="pvc-checkbox"]');
      const confirmDeleteButton = this._deleteBtn;

      await actionsButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.robustClick(actionsButton);

      await deleteButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.robustClick(deleteButton);

      await this.locator('text=Delete DataVolume?').waitFor({ state: 'visible', timeout: 5000 });

      const volumeNameInModal = this.locator(`strong:has-text("${volumeName}")`);
      const volumeNameExists = await volumeNameInModal
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      if (!volumeNameExists) {
        return false;
      }

      if (deletePvc) {
        const pvcCheckboxExists = await pvcCheckbox
          .isVisible({ timeout: 60000 })
          .catch(() => false);
        if (pvcCheckboxExists) {
          await pvcCheckbox.check({ force: true });
        }
      }

      await confirmDeleteButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.robustClick(confirmDeleteButton);

      return true;
    } catch {
      return false;
    }
  }

  async getResourceTitle(): Promise<string> {
    await this._resourceTitle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    return await this._resourceTitle.innerText();
  }

  async getStatusText(): Promise<string> {
    const statusText = this.locator('[data-test="status-text"]');
    await statusText.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    return await statusText.innerText();
  }

  async isResourceTitleEqualTo(
    expectedName: string,
    timeout: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<boolean> {
    try {
      const startTime = Date.now();
      const pollInterval = 500;

      while (Date.now() - startTime < timeout) {
        try {
          await this._resourceTitle.waitFor({ state: 'visible', timeout: pollInterval });

          const actualTitle = await this._resourceTitle.innerText();
          if (actualTitle?.trim() === expectedName.trim()) {
            return true;
          }
        } catch (error) {}

        await this.page.waitForTimeout(pollInterval);
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  async isStatusEqualTo(
    expectedStatus: string,
    timeout: number = TestTimeouts.DATA_VOLUME_STATUS,
  ): Promise<boolean> {
    try {
      await this.page.waitForFunction(
        ({ selector, expected }) => {
          const element = document.querySelector(selector);
          return element?.textContent?.trim() === expected;
        },
        { selector: '[data-test="status-text"]', expected: expectedStatus.trim() },
        { timeout },
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async navigateToDataVolumeDetail(volumeName: string, namespace: string): Promise<void> {
    await this.goTo(`/k8s/ns/${namespace}/cdi.kubevirt.io~v1beta1~DataVolume/${volumeName}`);
  }
}
