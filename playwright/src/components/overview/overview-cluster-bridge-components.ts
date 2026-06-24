import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import { waitForCondition } from '@/utils/wait-helpers';
import type { Page } from '@playwright/test';

import { OverviewSettingsComponent } from './overview-settings-component';

export class ClusterSettingsSharedComponent extends BaseComponent {
  private readonly _generalSettingsButton = this.locator('button:has-text("General settings")');
  private readonly _memoryDensityBtn = this.locator('button:has-text("Memory density")');
  private readonly _memoryDensityDisableConfirmButton = this.locator(
    '[data-test-id="memory-density-disable-confirm-button"]',
  );
  private readonly _memoryDensityModifyButtonButton = this.locator(
    '[data-test-id="memory-density-modify-button"] button',
  );
  private readonly _inputSliderValueInput = this.locator('input[aria-label="Slider value input"]');
  private readonly _memoryDensitySaveButton = this.locator(
    '[data-test-id="memory-density-save-button"]',
  );
  private readonly _memoryDensityToggle = this.locator('#memory-density-feature input');

  constructor(page: Page) {
    super(page);
  }

  async verifyInstalledVersion(
    expectedVersion = '4',
    expectedStatus = 'Up to date',
  ): Promise<boolean> {
    try {
      await this.page.waitForLoadState('domcontentloaded', {
        timeout: TestTimeouts.RESOURCE_CREATION,
      });
      await this.page.waitForLoadState('load', {
        timeout: TestTimeouts.RESOURCE_CREATION,
      });

      const versionEl = this.locator('[data-test-id="general-information-installed-version"]');
      const statusEl = this.locator('[data-test-id="general-information-update-status"]');

      await versionEl.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
      await statusEl.waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });

      await waitForCondition(
        async () => {
          const v = (await versionEl.textContent())?.trim() ?? '';
          const s = (await statusEl.textContent())?.trim() ?? '';
          return v !== '' && s !== '';
        },
        TestTimeouts.RESOURCE_CREATION,
        TestTimeouts.POLLING_INTERVAL,
      );

      const versionText = (await versionEl.textContent())?.trim() ?? '';
      const statusText = (await statusEl.textContent())?.trim() ?? '';

      return versionText.includes(expectedVersion) && statusText.includes(expectedStatus);
    } catch {
      return false;
    }
  }

  async setLiveMigrationLimits(
    parallelMigrationsPerCluster = '4',
    parallelOutboundMigrationsPerNode = '1',
  ) {
    const liveMigrationButton = this.page.getByRole('button', {
      name: 'Live migration',
      exact: true,
    });
    const parallelMigrationsPerClusterInput = this.locator(
      'input[name="parallelMigrationsPerCluster"]',
    );
    const parallelOutboundMigrationsPerNodeInput = this.locator(
      'input[name="parallelOutboundMigrationsPerNode"]',
    );
    const setLiveMigrationNetworkButton = this.locator(
      'button:has-text("Primary live migration network")',
    );

    await this._generalSettingsButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._generalSettingsButton);

    await liveMigrationButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(liveMigrationButton);

    await parallelMigrationsPerClusterInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await parallelMigrationsPerClusterInput.clear();
    await parallelMigrationsPerClusterInput.fill(parallelMigrationsPerCluster);
    await parallelMigrationsPerClusterInput.press('Tab');

    await parallelOutboundMigrationsPerNodeInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await parallelOutboundMigrationsPerNodeInput.clear();
    await parallelOutboundMigrationsPerNodeInput.fill(parallelOutboundMigrationsPerNode);
    await parallelOutboundMigrationsPerNodeInput.press('Tab');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const isNetworkEnabled = await setLiveMigrationNetworkButton
      .evaluate((el) => !el.classList.contains('pf-m-disabled') && !el.hasAttribute('disabled'))
      .catch(() => false);
    if (isNetworkEnabled) {
      await this.robustClick(setLiveMigrationNetworkButton);
      await this.page.keyboard.press('Escape');
    }
  }

  async openMemoryDensitySettings(): Promise<boolean> {
    try {
      await this._memoryDensityBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(this._memoryDensityBtn);
      return true;
    } catch {
      return false;
    }
  }

  async getMemoryDensityToggleState(): Promise<boolean> {
    try {
      await this._memoryDensityToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this._memoryDensityToggle.isChecked();
    } catch {
      return false;
    }
  }

  async waitForMemoryDensityToggleState(expectedState: boolean, timeout: number): Promise<void> {
    await this._memoryDensityToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    let attempts = 0;
    const maxAttempts = Math.ceil(timeout / 100);
    while (attempts < maxAttempts) {
      const currentState = await this._memoryDensityToggle.isChecked();
      if (currentState === expectedState) {
        return;
      }
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MICRO);
      attempts++;
    }

    const actualState = await this._memoryDensityToggle.isChecked();
    throw new Error(
      `Memory density toggle did not reach expected state. Expected: ${expectedState}, Actual: ${actualState}`,
    );
  }

  async toggleMemoryDensity(): Promise<boolean> {
    try {
      await this._memoryDensityToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      await this._memoryDensityToggle.click({ force: true });

      return true;
    } catch {
      return false;
    }
  }

  async enableMemoryDensity(): Promise<boolean> {
    try {
      await this._memoryDensityToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      const isCurrentlyEnabled = await this._memoryDensityToggle.isChecked();
      if (isCurrentlyEnabled) {
        return true;
      }

      await this._memoryDensityToggle.click({ force: true });

      return true;
    } catch {
      return false;
    }
  }

  async disableMemoryDensity(): Promise<boolean> {
    const maxRetries = 3;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.page
          .waitForLoadState('domcontentloaded', { timeout: TestTimeouts.UI_DELAY_MEDIUM })
          .catch(() => undefined);

        await this._memoryDensityToggle.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });

        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

        const isCurrentlyEnabled = await this._memoryDensityToggle.isChecked();
        if (!isCurrentlyEnabled) {
          return true;
        }

        await this._memoryDensityToggle.click({ force: true });

        await this._memoryDensityDisableConfirmButton.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });

        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        await this.robustClick(this._memoryDensityDisableConfirmButton);

        await this.waitForMemoryDensityToggleState(false, TestTimeouts.UI_ACTION_COMPLETE);

        return true;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries) {
          await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);
        }
      }
    }

    console.warn(`disableMemoryDensity failed after ${maxRetries} attempts: ${lastError?.message}`);
    return false;
  }

  async setMemoryDensityPercentage(percentage: string): Promise<boolean> {
    try {
      await this._memoryDensityModifyButtonButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(this._memoryDensityModifyButtonButton);

      await this._inputSliderValueInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this._inputSliderValueInput.clear();
      await this._inputSliderValueInput.fill(percentage);
      await this._inputSliderValueInput.press('Tab');

      await this._memoryDensitySaveButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(this._memoryDensitySaveButton);

      return true;
    } catch {
      return false;
    }
  }
}

export class OverviewSettingsBridgeComponent extends BaseComponent {
  private readonly _settings: OverviewSettingsComponent;

  constructor(page: Page) {
    super(page);
    this._settings = new OverviewSettingsComponent(page);
  }

  navigateToSettings(
    ...args: Parameters<OverviewSettingsComponent['navigateToSettings']>
  ): ReturnType<OverviewSettingsComponent['navigateToSettings']> {
    return this._settings.navigateToSettings(...args);
  }

  navigateToSettingsViaUI(
    ...args: Parameters<OverviewSettingsComponent['navigateToSettingsViaUI']>
  ): ReturnType<OverviewSettingsComponent['navigateToSettingsViaUI']> {
    return this._settings.navigateToSettingsViaUI(...args);
  }

  navigateToSettingsViaSidebar(
    ...args: Parameters<OverviewSettingsComponent['navigateToSettingsViaSidebar']>
  ): ReturnType<OverviewSettingsComponent['navigateToSettingsViaSidebar']> {
    return this._settings.navigateToSettingsViaSidebar(...args);
  }

  fillConfigurationSearchInput(
    ...args: Parameters<OverviewSettingsComponent['fillConfigurationSearchInput']>
  ): ReturnType<OverviewSettingsComponent['fillConfigurationSearchInput']> {
    return this._settings.fillConfigurationSearchInput(...args);
  }

  verifyHighlightedSearchResultsVisible(
    ...args: Parameters<OverviewSettingsComponent['verifyHighlightedSearchResultsVisible']>
  ): ReturnType<OverviewSettingsComponent['verifyHighlightedSearchResultsVisible']> {
    return this._settings.verifyHighlightedSearchResultsVisible(...args);
  }

  clickSearchResultMenuItem(
    ...args: Parameters<OverviewSettingsComponent['clickSearchResultMenuItem']>
  ): ReturnType<OverviewSettingsComponent['clickSearchResultMenuItem']> {
    return this._settings.clickSearchResultMenuItem(...args);
  }

  verifySettingsTabLoaded(
    ...args: Parameters<OverviewSettingsComponent['verifySettingsTabLoaded']>
  ): ReturnType<OverviewSettingsComponent['verifySettingsTabLoaded']> {
    return this._settings.verifySettingsTabLoaded(...args);
  }

  getSettingsTabNames(
    ...args: Parameters<OverviewSettingsComponent['getSettingsTabNames']>
  ): ReturnType<OverviewSettingsComponent['getSettingsTabNames']> {
    return this._settings.getSettingsTabNames(...args);
  }

  getGeneralSettingsSubSections(
    ...args: Parameters<OverviewSettingsComponent['getGeneralSettingsSubSections']>
  ): ReturnType<OverviewSettingsComponent['getGeneralSettingsSubSections']> {
    return this._settings.getGeneralSettingsSubSections(...args);
  }

  enableSSHUsingLoadBalancer(
    ...args: Parameters<OverviewSettingsComponent['enableSSHUsingLoadBalancer']>
  ): ReturnType<OverviewSettingsComponent['enableSSHUsingLoadBalancer']> {
    return this._settings.enableSSHUsingLoadBalancer(...args);
  }

  enableSSHOverNodePort(
    ...args: Parameters<OverviewSettingsComponent['enableSSHOverNodePort']>
  ): ReturnType<OverviewSettingsComponent['enableSSHOverNodePort']> {
    return this._settings.enableSSHOverNodePort(...args);
  }

  setGuestSystemLog(
    ...args: Parameters<OverviewSettingsComponent['setGuestSystemLog']>
  ): ReturnType<OverviewSettingsComponent['setGuestSystemLog']> {
    return this._settings.setGuestSystemLog(...args);
  }

  setHideYamlTab(
    ...args: Parameters<OverviewSettingsComponent['setHideYamlTab']>
  ): ReturnType<OverviewSettingsComponent['setHideYamlTab']> {
    return this._settings.setHideYamlTab(...args);
  }

  setVmActionsConfirmation(
    ...args: Parameters<OverviewSettingsComponent['setVmActionsConfirmation']>
  ): ReturnType<OverviewSettingsComponent['setVmActionsConfirmation']> {
    return this._settings.setVmActionsConfirmation(...args);
  }

  getVmActionsConfirmationState(
    ...args: Parameters<OverviewSettingsComponent['getVmActionsConfirmationState']>
  ): ReturnType<OverviewSettingsComponent['getVmActionsConfirmationState']> {
    return this._settings.getVmActionsConfirmationState(...args);
  }

  hideGuestCredentials(
    ...args: Parameters<OverviewSettingsComponent['hideGuestCredentials']>
  ): ReturnType<OverviewSettingsComponent['hideGuestCredentials']> {
    return this._settings.hideGuestCredentials(...args);
  }

  navigateToGuestManagement(
    ...args: Parameters<OverviewSettingsComponent['navigateToGuestManagement']>
  ): ReturnType<OverviewSettingsComponent['navigateToGuestManagement']> {
    return this._settings.navigateToGuestManagement(...args);
  }

  navigateToAutomaticSubscription(
    ...args: Parameters<OverviewSettingsComponent['navigateToAutomaticSubscription']>
  ): ReturnType<OverviewSettingsComponent['navigateToAutomaticSubscription']> {
    return this._settings.navigateToAutomaticSubscription(...args);
  }

  fillActivationKey(
    ...args: Parameters<OverviewSettingsComponent['fillActivationKey']>
  ): ReturnType<OverviewSettingsComponent['fillActivationKey']> {
    return this._settings.fillActivationKey(...args);
  }

  navigateToPreviewFeatures(
    ...args: Parameters<OverviewSettingsComponent['navigateToPreviewFeatures']>
  ): ReturnType<OverviewSettingsComponent['navigateToPreviewFeatures']> {
    return this._settings.navigateToPreviewFeatures(...args);
  }

  getPreviewFeatureLabels(
    ...args: Parameters<OverviewSettingsComponent['getPreviewFeatureLabels']>
  ): ReturnType<OverviewSettingsComponent['getPreviewFeatureLabels']> {
    return this._settings.getPreviewFeatureLabels(...args);
  }

  enableVmTemplatesPreviewFeature(
    ...args: Parameters<OverviewSettingsComponent['enableVmTemplatesPreviewFeature']>
  ): ReturnType<OverviewSettingsComponent['enableVmTemplatesPreviewFeature']> {
    return this._settings.enableVmTemplatesPreviewFeature(...args);
  }

  disableVmTemplatesPreviewFeature(
    ...args: Parameters<OverviewSettingsComponent['disableVmTemplatesPreviewFeature']>
  ): ReturnType<OverviewSettingsComponent['disableVmTemplatesPreviewFeature']> {
    return this._settings.disableVmTemplatesPreviewFeature(...args);
  }

  testVmFoldersSetting(
    ...args: Parameters<OverviewSettingsComponent['testVmFoldersSetting']>
  ): ReturnType<OverviewSettingsComponent['testVmFoldersSetting']> {
    return this._settings.testVmFoldersSetting(...args);
  }

  testPasstBindingSetting(
    ...args: Parameters<OverviewSettingsComponent['testPasstBindingSetting']>
  ): ReturnType<OverviewSettingsComponent['testPasstBindingSetting']> {
    return this._settings.testPasstBindingSetting(...args);
  }

  isPasstBindingChecked(
    ...args: Parameters<OverviewSettingsComponent['isPasstBindingChecked']>
  ): ReturnType<OverviewSettingsComponent['isPasstBindingChecked']> {
    return this._settings.isPasstBindingChecked(...args);
  }

  navigateToGeneralSettings(
    ...args: Parameters<OverviewSettingsComponent['navigateToGeneralSettings']>
  ): ReturnType<OverviewSettingsComponent['navigateToGeneralSettings']> {
    return this._settings.navigateToGeneralSettings(...args);
  }

  navigateToTemplatesAndImagesManagement(
    ...args: Parameters<OverviewSettingsComponent['navigateToTemplatesAndImagesManagement']>
  ): ReturnType<OverviewSettingsComponent['navigateToTemplatesAndImagesManagement']> {
    return this._settings.navigateToTemplatesAndImagesManagement(...args);
  }

  navigateToAutomaticImagesDownload(
    ...args: Parameters<OverviewSettingsComponent['navigateToAutomaticImagesDownload']>
  ): ReturnType<OverviewSettingsComponent['navigateToAutomaticImagesDownload']> {
    return this._settings.navigateToAutomaticImagesDownload(...args);
  }

  disableCentosStream9ImageCron(
    ...args: Parameters<OverviewSettingsComponent['disableCentosStream9ImageCron']>
  ): ReturnType<OverviewSettingsComponent['disableCentosStream9ImageCron']> {
    return this._settings.disableCentosStream9ImageCron(...args);
  }

  enableCentosStream9ImageCron(
    ...args: Parameters<OverviewSettingsComponent['enableCentosStream9ImageCron']>
  ): ReturnType<OverviewSettingsComponent['enableCentosStream9ImageCron']> {
    return this._settings.enableCentosStream9ImageCron(...args);
  }

  verifyCentosStream9ImageCronEnabled(
    ...args: Parameters<OverviewSettingsComponent['verifyCentosStream9ImageCronEnabled']>
  ): ReturnType<OverviewSettingsComponent['verifyCentosStream9ImageCronEnabled']> {
    return this._settings.verifyCentosStream9ImageCronEnabled(...args);
  }

  navigateToGettingStartedResources(
    ...args: Parameters<OverviewSettingsComponent['navigateToGettingStartedResources']>
  ): ReturnType<OverviewSettingsComponent['navigateToGettingStartedResources']> {
    return this._settings.navigateToGettingStartedResources(...args);
  }

  enableWelcomeInformation(
    ...args: Parameters<OverviewSettingsComponent['enableWelcomeInformation']>
  ): ReturnType<OverviewSettingsComponent['enableWelcomeInformation']> {
    return this._settings.enableWelcomeInformation(...args);
  }

  verifyWelcomeInformationUnchecked(
    ...args: Parameters<OverviewSettingsComponent['verifyWelcomeInformationUnchecked']>
  ): ReturnType<OverviewSettingsComponent['verifyWelcomeInformationUnchecked']> {
    return this._settings.verifyWelcomeInformationUnchecked(...args);
  }

  enableGuidedTour(
    ...args: Parameters<OverviewSettingsComponent['enableGuidedTour']>
  ): ReturnType<OverviewSettingsComponent['enableGuidedTour']> {
    return this._settings.enableGuidedTour(...args);
  }

  verifyGuidedTourSteps(
    ...args: Parameters<OverviewSettingsComponent['verifyGuidedTourSteps']>
  ): ReturnType<OverviewSettingsComponent['verifyGuidedTourSteps']> {
    return this._settings.verifyGuidedTourSteps(...args);
  }

  getGuidedTourStepTitles(
    ...args: Parameters<OverviewSettingsComponent['getGuidedTourStepTitles']>
  ): ReturnType<OverviewSettingsComponent['getGuidedTourStepTitles']> {
    return this._settings.getGuidedTourStepTitles(...args);
  }

  closeGuidedTour(
    ...args: Parameters<OverviewSettingsComponent['closeGuidedTour']>
  ): ReturnType<OverviewSettingsComponent['closeGuidedTour']> {
    return this._settings.closeGuidedTour(...args);
  }

  getWelcomeModalButtonTexts(
    ...args: Parameters<OverviewSettingsComponent['getWelcomeModalButtonTexts']>
  ): ReturnType<OverviewSettingsComponent['getWelcomeModalButtonTexts']> {
    return this._settings.getWelcomeModalButtonTexts(...args);
  }

  openAdvancedCdromFeaturesSettings(
    ...args: Parameters<OverviewSettingsComponent['openAdvancedCdromFeaturesSettings']>
  ): ReturnType<OverviewSettingsComponent['openAdvancedCdromFeaturesSettings']> {
    return this._settings.openAdvancedCdromFeaturesSettings(...args);
  }

  enableAdvancedCdromFeatures(
    ...args: Parameters<OverviewSettingsComponent['enableAdvancedCdromFeatures']>
  ): ReturnType<OverviewSettingsComponent['enableAdvancedCdromFeatures']> {
    return this._settings.enableAdvancedCdromFeatures(...args);
  }

  isAdvancedCdromFeaturesEnabled(
    ...args: Parameters<OverviewSettingsComponent['isAdvancedCdromFeaturesEnabled']>
  ): ReturnType<OverviewSettingsComponent['isAdvancedCdromFeaturesEnabled']> {
    return this._settings.isAdvancedCdromFeaturesEnabled(...args);
  }

  disableAdvancedCdromFeatures(
    ...args: Parameters<OverviewSettingsComponent['disableAdvancedCdromFeatures']>
  ): ReturnType<OverviewSettingsComponent['disableAdvancedCdromFeatures']> {
    return this._settings.disableAdvancedCdromFeatures(...args);
  }

  isWelcomeModalContentVisible(
    ...args: Parameters<OverviewSettingsComponent['isWelcomeModalContentVisible']>
  ): ReturnType<OverviewSettingsComponent['isWelcomeModalContentVisible']> {
    return this._settings.isWelcomeModalContentVisible(...args);
  }

  verifyWelcomeModalCreateFlow(
    ...args: Parameters<OverviewSettingsComponent['verifyWelcomeModalCreateFlow']>
  ): ReturnType<OverviewSettingsComponent['verifyWelcomeModalCreateFlow']> {
    return this._settings.verifyWelcomeModalCreateFlow(...args);
  }

  dismissWelcomeModalCheckbox(
    ...args: Parameters<OverviewSettingsComponent['dismissWelcomeModalCheckbox']>
  ): ReturnType<OverviewSettingsComponent['dismissWelcomeModalCheckbox']> {
    return this._settings.dismissWelcomeModalCheckbox(...args);
  }

  ensureWelcomeModalDismissed(
    ...args: Parameters<OverviewSettingsComponent['ensureWelcomeModalDismissed']>
  ): ReturnType<OverviewSettingsComponent['ensureWelcomeModalDismissed']> {
    return this._settings.ensureWelcomeModalDismissed(...args);
  }

  isWelcomeModalFlashing(
    ...args: Parameters<OverviewSettingsComponent['isWelcomeModalFlashing']>
  ): ReturnType<OverviewSettingsComponent['isWelcomeModalFlashing']> {
    return this._settings.isWelcomeModalFlashing(...args);
  }
}

export default OverviewSettingsComponent;
