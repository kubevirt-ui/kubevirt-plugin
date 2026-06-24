// BootableVolumeDetailPage — Page object for bootable volume detail interactions.

import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import BasePage from '../base-page';

export default class BootableVolumeDetailPage extends BasePage {
  private readonly _resourceTitle = this.locator('[data-test-id="resource-title"]');
  private readonly _roleTab = this.locator('[role="tab"]');
  private readonly _deleteBtn = this.locator('button:has-text("Delete")');

  constructor(page: Page) {
    super(page);
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
        } catch {}
        await this.page.waitForTimeout(pollInterval);
      }

      return false;
    } catch {
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
    } catch {
      return false;
    }
  }

  async navigateToBootableVolumeDetail(volumeName: string, namespace: string) {
    await this.goTo(`/k8s/ns/${namespace}/cdi.kubevirt.io~v1beta1~DataSource/${volumeName}`);
  }

  async verifyDetailTabsVisible(): Promise<boolean> {
    try {
      const detailsTab = this._roleTab.filter({ hasText: 'Details' });
      const yamlTab = this._roleTab.filter({ hasText: 'YAML' });
      await detailsTab.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await yamlTab.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
    }
  }

  async getDetailFieldValue(label: string): Promise<null | string> {
    try {
      const value = await this.page.evaluate((lbl: string) => {
        const dts = Array.from(document.querySelectorAll('main dt'));
        for (const dt of dts) {
          if (dt.textContent?.trim().startsWith(lbl)) {
            const dd = dt.nextElementSibling;
            if (dd?.tagName === 'DD') {
              return dd.textContent?.trim() || null;
            }
          }
        }
        return null;
      }, label);
      return value;
    } catch {
      return null;
    }
  }

  async verifyDetailFieldContains(label: string, expectedText: string): Promise<boolean> {
    const value = await this.getDetailFieldValue(label);
    if (!value) return false;
    return value.includes(expectedText);
  }

  async getBreadcrumbText(): Promise<null | string> {
    try {
      const breadcrumb = this.locator('nav[aria-label="Breadcrumb"] a').first();
      await breadcrumb.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await breadcrumb.innerText();
    } catch {
      return null;
    }
  }

  async getDetailFieldLabels(): Promise<string[]> {
    try {
      return await this.page.evaluate(() => {
        const dts = document.querySelectorAll('main dt');
        return Array.from(dts)
          .map((dt) => dt.textContent?.trim() || '')
          .filter(Boolean);
      });
    } catch {
      return [];
    }
  }

  async deleteBootableVolume(volumeName: string, deletePvc = false): Promise<boolean> {
    try {
      const actionsButton = this.locator('button:has-text("Actions")');
      await actionsButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.robustClick(actionsButton);

      const deleteButton = this._deleteBtn;
      await deleteButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.robustClick(deleteButton);

      await this.locator('text=Delete DataSource?').waitFor({ state: 'visible', timeout: 5000 });

      const volumeNameInModal = this.locator(`strong:has-text("${volumeName}")`);
      const volumeNameExists = await volumeNameInModal
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      if (!volumeNameExists) {
        return false;
      }

      if (deletePvc) {
        const pvcCheckbox = this.locator('input[id="pvc-checkbox"]');
        const pvcCheckboxExists = await pvcCheckbox
          .isVisible({ timeout: 60000 })
          .catch(() => false);
        if (pvcCheckboxExists) {
          await pvcCheckbox.check({ force: true });
        }
      }

      const confirmDeleteButton = this._deleteBtn;
      await confirmDeleteButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.robustClick(confirmDeleteButton);

      return true;
    } catch {
      return false;
    }
  }
}
