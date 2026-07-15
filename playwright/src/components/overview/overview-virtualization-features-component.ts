import BaseComponent from '@/components/shared/base-component';
import OverviewSettingsPage from '@/page-objects/overview/overview-settings-page';
import { regexFromLiteral } from '@/utils/regex-utils';
import { TestTimeouts } from '@/utils/test-config';
import { waitForCondition } from '@/utils/wait-helpers';
import type { Page } from '@playwright/test';

export default class OverviewVirtualizationFeaturesComponent extends BaseComponent {
  private static readonly _EXPECTED_FEATURE_SUMMARY_TEXTS = [
    'Cluster observability',
    'Network observability',
    'Host network management (NMState)',
    'Node Health Check (NHC)',
    'Fence Agents Remediation (FAR)',
    'Load balance',
  ] as const;
  private readonly _aaqSwitch = this.locator(
    '.section-with-switch:has-text("Application Aware Quota") .pf-v6-c-switch input',
  );
  private readonly _configureFeaturesBtn = this.locator('button:has-text("Configure features")');
  private readonly _deschedulerSection = this.locator('.descheduler-section');
  private readonly _generalSettingsButton = this.locator('button:has-text("General settings")');
  private readonly _highAvailabilitySummarySectionToggle = this.locator(
    '#high-availability-summary-section--toggle',
  );
  private readonly _inputSliderValueInput = this.locator('input[aria-label="Slider value input"]');
  private readonly _ksmCheckbox = this.locator('[data-test-id="kernel-samepage-merging"]');
  private readonly _memoryDensityBtn = this.locator('button:has-text("Memory density")');
  private readonly _memoryDensityDisableConfirmButton = this.locator(
    '[data-test-id="memory-density-disable-confirm-button"]',
  );
  private readonly _memoryDensityModifyButtonButton = this.locator(
    '[data-test-id="memory-density-modify-button"] button',
  );
  private readonly _memoryDensitySaveButton = this.locator(
    '[data-test-id="memory-density-save-button"]',
  );
  private readonly _memoryDensityToggle = this.locator('#memory-density-feature input');
  private readonly _memoryRequestRatioBtn = this.locator('button:has-text("Memory request ratio")');
  private readonly _memoryRequestRatioDecreaseBtn = this.locator(
    'button[aria-label="Decrease ratio"]',
  );
  private readonly _memoryRequestRatioIncreaseBtn = this.locator(
    'button[aria-label="Increase ratio"]',
  );
  private readonly _memoryRequestRatioInput = this.locator(
    'input[aria-label="Memory request ratio percentage"]',
  );

  private readonly _permissionsBtn = this.locator('button:has-text("Permissions")');
  private readonly _persistentReservationCheckbox = this.locator(
    '[data-test-id="persistent-reservation"]',
  );
  private readonly _resourceManagementBtn = this.locator('button:has-text("Resource management")');
  private readonly _sCSIPersistentReservationBtn = this.locator(
    'button:has-text("SCSI persistent reservation")',
  );

  private readonly _userButton = this.locator('button[role="tab"]', {
    hasText: 'User',
  });

  private readonly _virtualizationFeaturesBtn = this.locator(
    'button:has-text("Virtualization features")',
  );

  private readonly _wizardMain = this.locator('.pf-v6-c-wizard__main');

  constructor(page: Page) {
    super(page);
  }

  async adjustMemoryRequestRatio(steps: number): Promise<boolean> {
    try {
      const btn =
        steps < 0 ? this._memoryRequestRatioDecreaseBtn : this._memoryRequestRatioIncreaseBtn;
      await btn.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      const count = Math.abs(steps);
      for (let i = 0; i < count; i++) {
        await this.robustClick(btn);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }
      return true;
    } catch {
      return false;
    }
  }

  async clickHighAvailabilitySummarySectionToggle(): Promise<void> {
    await this._highAvailabilitySummarySectionToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._highAvailabilitySummarySectionToggle);
  }

  async clickVirtualizationFeaturesWizardSubmit(): Promise<void> {
    await this.locator(
      '.virtualization-features-configuration-wizard button[type="submit"]',
    ).waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(
      this.locator('.virtualization-features-configuration-wizard button[type="submit"]'),
    );
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

  async enableAaq(): Promise<boolean> {
    try {
      const alreadyEnabled = await this.isAaqEnabled();
      if (alreadyEnabled) return true;
      await this._aaqSwitch.first().click({ force: true });
      await this.page.waitForTimeout(TestTimeouts.CLUSTER_STATE_PROPAGATION);
      return await this.isAaqEnabled();
    } catch {
      return false;
    }
  }

  async enableClusterObservabilityInWizard(): Promise<boolean> {
    try {
      const control = this.locator('[data-test-id="cluster-observability-operator"]');
      await control.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      const checked = await control.isChecked().catch(() => false);
      if (!checked) {
        await this.robustClick(control);
      }
      return true;
    } catch {
      return false;
    }
  }

  async enableKSM(): Promise<void> {
    await this._ksmCheckbox.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._ksmCheckbox.click({ force: true });
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

  async enablePersistentReservation(): Promise<void> {
    await this._sCSIPersistentReservationBtn.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._sCSIPersistentReservationBtn);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    await this._persistentReservationCheckbox.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._persistentReservationCheckbox.click({ force: true });
  }

  async enableVirtualizationOptimizedAndCooLoggingMonitoring(): Promise<boolean> {
    try {
      const labels = [
        'Virtualization optimized',
        'Cluster Observability',
        'logging and monitoring',
      ];
      for (const label of labels) {
        await this.enableWizardFeatureByLabel(label);
      }
      return true;
    } catch {
      return false;
    }
  }

  async enableWizardFeatureByLabel(labelText: string): Promise<boolean> {
    try {
      const withinWizard = this._wizardMain;
      const regex = regexFromLiteral(labelText);

      const checkbox = withinWizard.getByRole('checkbox', { name: regex }).first();
      const checkVisible = await checkbox.isVisible().catch(() => false);
      if (checkVisible) {
        const checked = await checkbox.isChecked().catch(() => false);
        if (!checked) await this.robustClick(checkbox);
        return true;
      }

      const switchRole = withinWizard.getByRole('switch', { name: regex }).first();
      const switchVisible = await switchRole.isVisible().catch(() => false);
      if (switchVisible) {
        const checked = await switchRole.isChecked().catch(() => false);
        if (!checked) await this.robustClick(switchRole);
        return true;
      }

      const labelLocator = withinWizard.getByText(regex).first();
      const labelVisible = await labelLocator.isVisible().catch(() => false);
      if (labelVisible) {
        const control = labelLocator.locator('..').locator('input, [role="switch"]').first();
        if (await control.isVisible().catch(() => false)) {
          const checked = await control.isChecked().catch(() => false);
          if (!checked) await this.robustClick(control);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  async finishWizardAndVerifyClosed(): Promise<boolean> {
    try {
      const finishButton = this._wizardMain.getByRole('button', { name: 'Finish' });
      await finishButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK });
      await this.robustClick(finishButton);

      await this._wizardMain.waitFor({
        state: 'hidden',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      });
      return true;
    } catch {
      return false;
    }
  }

  async getClusterSettingsSectionNames(): Promise<string[]> {
    const knownSections = [
      'Virtualization features',
      'General settings',
      'Guest management',
      'Resource management',
      'SCSI persistent reservation',
    ];
    const found: string[] = [];
    for (const section of knownSections) {
      const btn = this.locator(`button:has-text("${section}")`).first();
      const visible = await btn
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK })
        .then(() => true)
        .catch(() => false);
      if (visible) {
        found.push(section);
      }
    }
    return found;
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

  async getMemoryRequestRatioValue(): Promise<string | null> {
    try {
      await this._memoryRequestRatioInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this._memoryRequestRatioInput.inputValue();
    } catch {
      return null;
    }
  }

  async getVirtualizationFeatureItems(): Promise<string[]> {
    const knownFeatures = [
      'Cluster observability',
      'Network observability',
      'Host network management',
      'High availability',
      'Load balance',
    ];
    const found: string[] = [];
    for (const feature of knownFeatures) {
      const item = this.locator(`text=${feature}`).first();
      const visible = await item
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK })
        .then(() => true)
        .catch(() => false);
      if (visible) {
        found.push(feature);
      }
    }
    return found;
  }

  async isAaqControlVisible(timeoutMs: number = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    return await this._aaqSwitch
      .first()
      .isVisible({ timeout: timeoutMs })
      .catch(() => false);
  }

  async isAaqEnabled(): Promise<boolean> {
    try {
      await this._aaqSwitch.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this._aaqSwitch.first().isChecked();
    } catch {
      return false;
    }
  }

  async isConfigureFeaturesButtonVisible(): Promise<boolean> {
    try {
      const btn = this._configureFeaturesBtn;
      await btn.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }

  async isKsmControlVisible(timeoutMs: number = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    return await this._ksmCheckbox.isVisible({ timeout: timeoutMs }).catch(() => false);
  }

  async isManageQuotasLinkVisible(): Promise<boolean> {
    return await this.locator('a:has-text("Manage quotas")')
      .first()
      .isVisible({ timeout: TestTimeouts.ELEMENT_WAIT })
      .catch(() => false);
  }

  async navigateToPermissions() {
    await new OverviewSettingsPage(this.page).navigateToSettings();
    await this._userButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._userButton);
    await this._permissionsBtn.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._permissionsBtn);
  }

  async navigateToResourceManagement() {
    await new OverviewSettingsPage(this.page).navigateToSettings();
    await this._resourceManagementBtn.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._resourceManagementBtn);
  }

  async navigateToVirtualizationFeatures() {
    await new OverviewSettingsPage(this.page).navigateToSettings();
    await this._virtualizationFeaturesBtn.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._virtualizationFeaturesBtn);
  }

  async navigateToWizardSummaryStep(): Promise<boolean> {
    try {
      const nextButton = this._wizardMain.locator('button:has-text("Next")');
      await nextButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK });
      await this.robustClick(nextButton);

      const finishButton = this._wizardMain.getByRole('button', { name: 'Finish' });
      await finishButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK });
      return await finishButton.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async navigateWizardStepsAndVerifySummary(): Promise<boolean> {
    try {
      await this.clickHighAvailabilitySummarySectionToggle();
      const summaryItemsValid = await this.verifyFeatureSummaryItemsContainExpectedTexts();
      if (!summaryItemsValid) return false;
      await this.clickVirtualizationFeaturesWizardSubmit();
      return true;
    } catch {
      return false;
    }
  }

  async openConfigureFeaturesWizard() {
    await this._configureFeaturesBtn.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._configureFeaturesBtn);
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

  async openMemoryRequestRatioSettings(): Promise<boolean> {
    try {
      await this._memoryRequestRatioBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(this._memoryRequestRatioBtn);
      return true;
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
    await parallelMigrationsPerClusterInput.dispatchEvent('blur');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    await parallelOutboundMigrationsPerNodeInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await parallelOutboundMigrationsPerNodeInput.clear();
    await parallelOutboundMigrationsPerNodeInput.fill(parallelOutboundMigrationsPerNode);
    await parallelOutboundMigrationsPerNodeInput.dispatchEvent('blur');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    const isNetworkEnabled = await setLiveMigrationNetworkButton
      .evaluate((el) => !el.classList.contains('pf-m-disabled') && !el.hasAttribute('disabled'))
      .catch(() => false);
    if (isNetworkEnabled) {
      await this.robustClick(setLiveMigrationNetworkButton);
      await this.page.keyboard.press('Escape');
    }
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

  async testLoadBalanceFeature(): Promise<boolean> {
    try {
      await this.locator(
        'button:has-text("Load balance"), a:has-text("Load balance"), :text("Load balance")',
      )
        .first()
        .waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
      await this.robustClick(
        this.locator(
          'button:has-text("Load balance"), a:has-text("Load balance"), :text("Load balance")',
        ).first(),
      );
      await this._deschedulerSection
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => {
          return;
        });
      return await this._deschedulerSection.isVisible().catch(() => false);
    } catch {
      return false;
    }
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

  async verifyClusterObservabilityEnabled(): Promise<boolean> {
    try {
      const item = this.page
        .locator('.featured-operator-item')
        .filter({ hasText: 'Cluster observability (COO)' });
      const installedIcon = item.locator('.installed-icon');
      await installedIcon.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
    }
  }

  async verifyConfigurationWizard(): Promise<boolean> {
    try {
      const titleLocator = this.locator('h1, h2').filter({ hasText: 'Configuration' });
      const subtitleLocator = this.locator('h2, .pf-v6-c-wizard__main').filter({
        hasText: 'Virtualization features',
      });

      const [titleExists, subtitleExists] = await Promise.all([
        titleLocator
          .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
          .then(() => true)
          .catch(() => false),
        subtitleLocator
          .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
          .then(() => true)
          .catch(() => false),
      ]);

      return titleExists && subtitleExists;
    } catch {
      return false;
    }
  }

  async verifyFeatureSummaryContainsClusterObservabilityInstalled(): Promise<boolean> {
    try {
      const item = this._wizardMain
        .locator('.feature-summary-item, [class*="summary-item"], li, dd')
        .filter({ hasText: /Cluster observability/i })
        .filter({ hasText: /Installed/i })
        .first();
      await item.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await item.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyFeatureSummaryItemsContainExpectedTexts(): Promise<boolean> {
    try {
      for (const expected of OverviewVirtualizationFeaturesComponent._EXPECTED_FEATURE_SUMMARY_TEXTS) {
        const item = this._wizardMain
          .locator('.feature-summary-item')
          .filter({ hasText: expected });
        await item.first().waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
      }
      return true;
    } catch {
      return false;
    }
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

  async verifyKSMEnabled(): Promise<boolean> {
    try {
      await this._ksmCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this._ksmCheckbox.isChecked().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyPersistentReservationEnabled(): Promise<boolean> {
    try {
      await this._persistentReservationCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
      return await this._persistentReservationCheckbox.isChecked().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyUserPermissions(): Promise<boolean> {
    try {
      const [attachExists, cloneExists, uploadExists] = await Promise.all([
        this.locator('text=Attach VirtualMachine to multiple networks')
          .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
          .then(() => true)
          .catch(() => false),
        this.locator('text=Clone a VirtualMachine')
          .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
          .then(() => true)
          .catch(() => false),
        this.locator('text=Upload a base image from local disk')
          .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
          .then(() => true)
          .catch(() => false),
      ]);
      return attachExists && cloneExists && uploadExists;
    } catch {
      return false;
    }
  }

  async verifyVirtualizationFeatures(): Promise<boolean> {
    try {
      const features = ['Network observability', 'Host network management', 'High availability'];
      for (const feature of features) {
        const item = this.locator(`text=${feature}`).first();
        await item.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      }
      return true;
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
}
