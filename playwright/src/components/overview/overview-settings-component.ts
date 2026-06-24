import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import { OverviewSettingsBaseComponent } from './overview-settings-base-component';

export class OverviewSettingsComponent extends OverviewSettingsBaseComponent {
  async navigateToPreviewFeatures(): Promise<boolean> {
    try {
      await this.navigateToSettings();
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);

      const previewBtn = this.locator('button:has-text("Preview features")');
      await previewBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(previewBtn);

      const heading = this.locator('h5:has-text("Preview features")');
      await heading.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return await heading.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async getPreviewFeatureLabels(): Promise<string[]> {
    try {
      const featureContainers = this.locator(
        '.section-with-switch .section-with-switch__text span',
      );
      await featureContainers.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      const texts = await featureContainers.allTextContents();
      return texts.map((t: string) => t.trim()).filter(Boolean);
    } catch {
      return [];
    }
  }

  async enableVmTemplatesPreviewFeature(): Promise<boolean> {
    try {
      const toggle = this._vmTemplates;
      await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

      if (await toggle.isChecked()) {
        return true;
      }

      const patchPromise = this.page.waitForResponse(
        (resp: {
          url: () => string;
          request: () => { method: () => string };
          status: () => number;
        }) =>
          (resp.url().includes('kubevirt-ui-features') ||
            resp.url().includes('kubevirt-user-settings')) &&
          (resp.request().method() === 'PATCH' || resp.request().method() === 'PUT') &&
          resp.status() >= 200 &&
          resp.status() < 300,
        { timeout: TestTimeouts.DEFAULT },
      );
      await toggle.click({ force: true });
      await patchPromise.catch(() => void 0);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      for (let i = 0; i < 10; i++) {
        const state = await toggle.isChecked().catch(() => false);
        if (state) return true;
        await this.page.waitForTimeout(500);
      }

      return await toggle.isChecked().catch(() => false);
    } catch {
      return false;
    }
  }

  async disableVmTemplatesPreviewFeature(): Promise<boolean> {
    try {
      const toggle = this._vmTemplates;
      await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

      if (!(await toggle.isChecked())) {
        return true;
      }

      const patchPromise = this.page.waitForResponse(
        (resp: {
          url: () => string;
          request: () => { method: () => string };
          status: () => number;
        }) =>
          (resp.url().includes('kubevirt-ui-features') ||
            resp.url().includes('kubevirt-user-settings')) &&
          (resp.request().method() === 'PATCH' || resp.request().method() === 'PUT') &&
          resp.status() >= 200 &&
          resp.status() < 300,
        { timeout: TestTimeouts.DEFAULT },
      );
      await toggle.click({ force: true });
      await patchPromise.catch(() => void 0);

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      return !(await toggle.isChecked().catch(() => true));
    } catch {
      return false;
    }
  }

  async testVmFoldersSetting(): Promise<boolean> {
    try {
      await this._treeViewFolders.waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await this._treeViewFolders.check({ force: true });
      const isUnchecked = !(await this._treeViewFolders.isChecked());
      if (isUnchecked) {
        return false;
      }

      await this._treeViewFolders.waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await this._treeViewFolders.check({ force: true });

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

      const isChecked = await this._treeViewFolders.isChecked();
      return isChecked;
    } catch {
      return false;
    }
  }

  async testPasstBindingSetting(): Promise<boolean> {
    try {
      await this._passtUDNNetworkCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this.page.waitForLoadState('load');
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      await this._passtUDNNetworkCheckbox.check({ force: true });
      return true;
    } catch {
      return false;
    }
  }

  async isPasstBindingChecked(): Promise<boolean> {
    try {
      await this._passtUDNNetworkCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      const startTime = Date.now();
      const timeout = TestTimeouts.UI_ACTION_COMPLETE;
      while (Date.now() - startTime < timeout) {
        if (await this._passtUDNNetworkCheckbox.isChecked()) {
          return true;
        }
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MICRO);
      }
      return await this._passtUDNNetworkCheckbox.isChecked();
    } catch {
      return false;
    }
  }

  async navigateToGeneralSettings(): Promise<boolean> {
    try {
      await this._generalSettingsButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(this._generalSettingsButton);
      await this.page
        .waitForLoadState('domcontentloaded', { timeout: TestTimeouts.RESOURCE_CREATION })
        .catch(() => {
          return;
        });
      await this.page.waitForTimeout(TestTimeouts.POLLING_INTERVAL);
      return true;
    } catch {
      return false;
    }
  }

  // --- Inlined from applyMemoryDensityDelegations ---

  async navigateToTemplatesAndImagesManagement(): Promise<boolean> {
    try {
      await this._templatesAndImagesManagementBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await this.robustClick(this._templatesAndImagesManagementBtn);
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);
      return true;
    } catch {
      return false;
    }
  }

  async navigateToAutomaticImagesDownload(): Promise<boolean> {
    try {
      await this.navigateToTemplatesAndImagesManagement();
      await this._automaticImagesDownloadBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(this._automaticImagesDownloadBtn);
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);
      return true;
    } catch {
      return false;
    }
  }

  async disableCentosStream9ImageCron(): Promise<boolean> {
    try {
      await this._centosStream9ImageCronSwitch.waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await this._centosStream9ImageCronSwitch.click({ force: true });
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_LONG);
      return true;
    } catch {
      return false;
    }
  }

  async enableCentosStream9ImageCron(): Promise<boolean> {
    try {
      await this._centosStream9ImageCronSwitch.waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      const isEnabled = await this._centosStream9ImageCronSwitch.isChecked().catch(() => false);
      if (!isEnabled) {
        await this._centosStream9ImageCronSwitch.click({ force: true });
      }
      return true;
    } catch {
      return false;
    }
  }

  async verifyCentosStream9ImageCronEnabled(): Promise<boolean> {
    try {
      await this._centosStream9ImageCronSwitch.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this._centosStream9ImageCronSwitch.isChecked().catch(() => false);
    } catch {
      return false;
    }
  }

  async navigateToGettingStartedResources(): Promise<boolean> {
    try {
      await this.navigateToSettings();

      const userButton = this.locator('button:has-text("User")');
      await userButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK });
      await this.robustClick(userButton);

      const gettingStartedButton = this.locator('button:has-text("Getting started resources")');
      await gettingStartedButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await this.robustClick(gettingStartedButton);
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);
      return true;
    } catch {
      return false;
    }
  }

  async enableWelcomeInformation(): Promise<boolean> {
    try {
      const welcomeInfoSwitch = this.locator(
        'label:has-text("Welcome information") input[type="checkbox"]',
      );
      await welcomeInfoSwitch.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await welcomeInfoSwitch.check({ force: true });
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);
      return true;
    } catch {
      return false;
    }
  }

  async verifyWelcomeInformationUnchecked(): Promise<boolean> {
    try {
      const welcomeInfoSwitch = this.locator(
        'label:has-text("Welcome information") input[type="checkbox"]',
      );
      await welcomeInfoSwitch.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      const isChecked = await welcomeInfoSwitch.isChecked();
      return !isChecked;
    } catch {
      return false;
    }
  }

  async enableGuidedTour(): Promise<boolean> {
    try {
      const guidedTourSwitch = this.locator('label:has-text("Guided tour") input[type="checkbox"]');
      await guidedTourSwitch.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await guidedTourSwitch.click({ force: true });
      return true;
    } catch {
      return false;
    }
  }

  async verifyGuidedTourSteps(): Promise<boolean> {
    try {
      const guidedTourContainer = this._kvTourPopoverKvTourPopoverHeader;
      const exists = await guidedTourContainer
        .isVisible({ timeout: TestTimeouts.UI_VISIBILITY_QUICK })
        .catch(() => false);
      return exists;
    } catch {
      return false;
    }
  }

  async getGuidedTourStepTitles(): Promise<string[]> {
    const titles: string[] = [];
    const popoverHeader = this._kvTourPopoverKvTourPopoverHeader;

    await popoverHeader.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });

    titles.push((await popoverHeader.textContent())?.trim() ?? '');

    const nextButton = this.locator('.kv-tour-popover button:has-text("Next")');
    while (
      await nextButton.isVisible({ timeout: TestTimeouts.UI_ANIMATION_DELAY }).catch(() => false)
    ) {
      await nextButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      await popoverHeader.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      const title = (await popoverHeader.textContent())?.trim() ?? '';
      titles.push(title);
      if (title === "You're all set!") break;
    }

    return titles;
  }

  async closeGuidedTour(): Promise<void> {
    const closeButton = this.locator('.kv-tour-popover button[aria-label="Close"]');
    if (
      await closeButton.isVisible({ timeout: TestTimeouts.UI_ANIMATION_DELAY }).catch(() => false)
    ) {
      await closeButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_ANIMATION_DELAY);
    }
  }

  async getWelcomeModalButtonTexts(): Promise<string[]> {
    const modal = this._ariaWelcomeModal;
    const isVisible = await modal.isVisible().catch(() => false);
    if (!isVisible) return [];
    const buttons = modal.locator('button.WelcomeModal__button');
    const count = await buttons.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = (await buttons.nth(i).textContent())?.trim() ?? '';
      if (text) texts.push(text);
    }
    return texts;
  }

  async openAdvancedCdromFeaturesSettings(): Promise<boolean> {
    try {
      await this._advancedCDROMFeaturesBtn.waitFor({
        state: 'visible',
      });
      await this.robustClick(this._advancedCDROMFeaturesBtn);
      return await this._advancedCdromFeaturesToggle.isVisible();
    } catch {
      return false;
    }
  }

  async enableAdvancedCdromFeatures(): Promise<boolean> {
    try {
      const isChecked = await this._advancedCdromFeaturesToggle.isChecked().catch(() => false);
      if (isChecked) {
        return true;
      }
      await this._advancedCdromFeaturesToggle.click({ force: true });
      await this.waitForSuccessAlertVisible();
      return true;
    } catch {
      return false;
    }
  }

  async isAdvancedCdromFeaturesEnabled(): Promise<boolean> {
    try {
      return await this._advancedCdromFeaturesToggle.isChecked().catch(() => false);
    } catch {
      return false;
    }
  }

  async disableAdvancedCdromFeatures(): Promise<boolean> {
    try {
      const isChecked = await this._advancedCdromFeaturesToggle.isChecked().catch(() => false);
      if (!isChecked) {
        return true;
      }
      await this._advancedCdromFeaturesToggle.click({ force: true });
      await this.waitForSuccessAlertVisible();
      return true;
    } catch {
      return false;
    }
  }

  async isWelcomeModalContentVisible(): Promise<boolean> {
    const bodyText = await this.page.textContent('body');
    return !!(bodyText && bodyText.includes('Do not show this again'));
  }

  async verifyWelcomeModalCreateFlow(timeout = TestTimeouts.UI_VISIBILITY_QUICK) {
    const subtitle = this.locator('text=Welcome to');
    await subtitle.waitFor({ state: 'visible', timeout });
    const subtitleVisible = await subtitle.isVisible();

    const createButton = this.locator('button:has-text("Create")');
    await this.robustClick(createButton);

    const fedora = this.locator('#name', { hasText: 'fedora' });
    await fedora.waitFor({ state: 'visible', timeout });
    const fedoraVisible = await fedora.isVisible();

    return { subtitleVisible, fedoraVisible };
  }

  async dismissWelcomeModalCheckbox(timeout = TestTimeouts.UI_VISIBILITY_QUICK): Promise<void> {
    const welcomeModal = this._ariaWelcomeModal;
    const isVisible = await welcomeModal.isVisible().catch(() => false);
    if (isVisible) {
      const checkbox = this._idWelcomeModalCheckbox;
      await checkbox.waitFor({ state: 'visible', timeout });
      await checkbox.click({ force: true });
    }
  }

  async ensureWelcomeModalDismissed(): Promise<void> {
    await this.page.waitForTimeout(TestTimeouts.UI_VISIBILITY_QUICK);
    const bodyText = await this.page.textContent('body');
    if (bodyText && bodyText.includes('Do not show this again')) {
      const checkbox = this._idWelcomeModalCheckbox;
      await checkbox.check().catch(() => undefined);
    }
  }

  async isWelcomeModalFlashing(pollDurationMs = 1500, intervalMs = 50): Promise<boolean> {
    const deadline = Date.now() + pollDurationMs;
    const modal = this._ariaWelcomeModal;
    while (Date.now() < deadline) {
      const visible = await modal.isVisible({ timeout: 0 }).catch(() => false);
      if (visible) return true;
      await this.page.waitForTimeout(intervalMs);
    }
    return false;
  }

  async waitForSuccessAlertVisible(): Promise<boolean> {
    const successAlert = this.locator('[role="alert"].pf-m-success');
    try {
      await successAlert.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return await successAlert.isVisible();
    } catch {
      return false;
    }
  }

  async getVmActionsConfirmationState(): Promise<boolean> {
    try {
      const isVisible = await this._vmActionsConfirmationToggle
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false);

      if (!isVisible) {
        await this._generalSettingsButton.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        await this.robustClick(this._generalSettingsButton);
        await this._vmActionsConfirmationBtn.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        await this.robustClick(this._vmActionsConfirmationBtn);
      }

      await this._vmActionsConfirmationToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return this._vmActionsConfirmationToggle.isChecked();
    } catch {
      return false;
    }
  }

  async setVmActionsConfirmation(enabled: boolean): Promise<boolean> {
    try {
      const isVisible = await this._vmActionsConfirmationToggle
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false);

      if (!isVisible) {
        await this._generalSettingsButton.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        await this.robustClick(this._generalSettingsButton);
        await this._vmActionsConfirmationBtn.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        await this.robustClick(this._vmActionsConfirmationBtn);
      }

      await this._vmActionsConfirmationToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      const current = await this._vmActionsConfirmationToggle.isChecked().catch(() => false);
      if (current !== enabled) {
        await this._vmActionsConfirmationToggle.click({ force: true });
      }
      return enabled;
    } catch {
      return !enabled;
    }
  }
}
