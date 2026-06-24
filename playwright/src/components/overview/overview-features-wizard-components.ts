import {
  ClusterSettingsSharedComponent,
  OverviewSettingsComponent,
} from '@/components/overview/overview-settings-components';
import BaseComponent from '@/components/shared/base-component';
import { regexFromLiteral } from '@/utils/regex-utils';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class OverviewVirtualizationFeaturesComponent extends BaseComponent {
  readonly clusterSettings: ClusterSettingsSharedComponent;

  private readonly _virtualizationFeaturesBtn = this.locator(
    'button:has-text("Virtualization features")',
  );
  private readonly _resourceManagementBtn = this.locator('button:has-text("Resource management")');
  private readonly _deschedulerSection = this.locator('.descheduler-section');
  private readonly _sCSIPersistentReservationBtn = this.locator(
    'button:has-text("SCSI persistent reservation")',
  );
  private readonly _permissionsBtn = this.locator('button:has-text("Permissions")');
  private readonly _userButton = this.locator('button[role="tab"]', {
    hasText: 'User',
  });

  private readonly _ksmCheckbox = this.locator('[data-test-id="kernel-samepage-merging"]');
  private readonly _aaqSwitch = this.locator(
    '.section-with-switch:has-text("Application Aware Quota") .pf-v6-c-switch input',
  );
  private readonly _persistentReservationCheckbox = this.locator(
    '[data-test-id="persistent-reservation"]',
  );

  private readonly _wizard: VirtualizationFeaturesWizardComponent;

  constructor(page: Page) {
    super(page);
    this.clusterSettings = new ClusterSettingsSharedComponent(page);
    this._wizard = new VirtualizationFeaturesWizardComponent(page);
  }

  async navigateToVirtualizationFeatures() {
    await new OverviewSettingsComponent(this.page).navigateToSettings();
    await this._virtualizationFeaturesBtn.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._virtualizationFeaturesBtn);
  }

  async navigateToResourceManagement() {
    await new OverviewSettingsComponent(this.page).navigateToSettings();
    await this._resourceManagementBtn.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._resourceManagementBtn);
  }

  async verifyVirtualizationFeatures(): Promise<boolean> {
    try {
      const [networkObsExists, hostNetExists, haExists] = await Promise.all([
        this.locator(
          'button:has-text("Network observability"), a:has-text("Network observability"), :text("Network observability")',
        )
          .first()
          .isVisible()
          .catch(() => false),
        this.locator(
          'button:has-text("Host network management"), a:has-text("Host network management"), :text("Host network management")',
        )
          .first()
          .isVisible()
          .catch(() => false),
        this.locator(
          'button:has-text("High availability"), a:has-text("High availability"), :text("High availability")',
        )
          .first()
          .isVisible()
          .catch(() => false),
      ]);
      return networkObsExists && hostNetExists && haExists;
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

  async openConfigureFeaturesWizard() {
    return this._wizard.openConfigureFeaturesWizard();
  }
  async verifyConfigurationWizard(): Promise<boolean> {
    return this._wizard.verifyConfigurationWizard();
  }
  async navigateToWizardSummaryStep(): Promise<boolean> {
    return this._wizard.navigateToWizardSummaryStep();
  }
  async clickHighAvailabilitySummarySectionToggle(): Promise<void> {
    return this._wizard.clickHighAvailabilitySummarySectionToggle();
  }
  async verifyFeatureSummaryItemsContainExpectedTexts(): Promise<boolean> {
    return this._wizard.verifyFeatureSummaryItemsContainExpectedTexts();
  }
  async verifyFeatureSummaryContainsClusterObservabilityInstalled(): Promise<boolean> {
    return this._wizard.verifyFeatureSummaryContainsClusterObservabilityInstalled();
  }
  async finishWizardAndVerifyClosed(): Promise<boolean> {
    return this._wizard.finishWizardAndVerifyClosed();
  }
  async navigateWizardStepsAndVerifySummary(): Promise<boolean> {
    return this._wizard.navigateWizardStepsAndVerifySummary();
  }
  async enableWizardFeatureByLabel(labelText: string): Promise<boolean> {
    return this._wizard.enableWizardFeatureByLabel(labelText);
  }
  async enableVirtualizationOptimizedAndCooLoggingMonitoring(): Promise<boolean> {
    return this._wizard.enableVirtualizationOptimizedAndCooLoggingMonitoring();
  }
  async enableClusterObservabilityInWizard(): Promise<boolean> {
    return this._wizard.enableClusterObservabilityInWizard();
  }
  async clickVirtualizationFeaturesWizardSubmit(): Promise<void> {
    return this._wizard.clickVirtualizationFeaturesWizardSubmit();
  }
  async verifyClusterObservabilityEnabled(): Promise<boolean> {
    return this._wizard.verifyClusterObservabilityEnabled();
  }

  async enableKSM(): Promise<void> {
    await this._ksmCheckbox.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._ksmCheckbox.click({ force: true });
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

  async isKsmControlVisible(timeoutMs: number = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    return await this._ksmCheckbox.isVisible({ timeout: timeoutMs }).catch(() => false);
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

  async isAaqControlVisible(timeoutMs: number = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    return await this._aaqSwitch
      .first()
      .isVisible({ timeout: timeoutMs })
      .catch(() => false);
  }

  async isManageQuotasLinkVisible(): Promise<boolean> {
    return await this.locator('a:has-text("Manage quotas")')
      .first()
      .isVisible({ timeout: TestTimeouts.ELEMENT_WAIT })
      .catch(() => false);
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

  async navigateToPermissions() {
    await new OverviewSettingsComponent(this.page).navigateToSettings();
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

  async verifyInstalledVersion(
    ...args: Parameters<ClusterSettingsSharedComponent['verifyInstalledVersion']>
  ): ReturnType<ClusterSettingsSharedComponent['verifyInstalledVersion']> {
    return this.clusterSettings.verifyInstalledVersion(...args);
  }

  async setLiveMigrationLimits(
    ...args: Parameters<ClusterSettingsSharedComponent['setLiveMigrationLimits']>
  ): ReturnType<ClusterSettingsSharedComponent['setLiveMigrationLimits']> {
    return this.clusterSettings.setLiveMigrationLimits(...args);
  }

  async openMemoryDensitySettings(): ReturnType<
    ClusterSettingsSharedComponent['openMemoryDensitySettings']
  > {
    return this.clusterSettings.openMemoryDensitySettings();
  }

  async getMemoryDensityToggleState(): ReturnType<
    ClusterSettingsSharedComponent['getMemoryDensityToggleState']
  > {
    return this.clusterSettings.getMemoryDensityToggleState();
  }

  async waitForMemoryDensityToggleState(
    ...args: Parameters<ClusterSettingsSharedComponent['waitForMemoryDensityToggleState']>
  ): ReturnType<ClusterSettingsSharedComponent['waitForMemoryDensityToggleState']> {
    return this.clusterSettings.waitForMemoryDensityToggleState(...args);
  }

  async toggleMemoryDensity(): ReturnType<ClusterSettingsSharedComponent['toggleMemoryDensity']> {
    return this.clusterSettings.toggleMemoryDensity();
  }

  async enableMemoryDensity(): ReturnType<ClusterSettingsSharedComponent['enableMemoryDensity']> {
    return this.clusterSettings.enableMemoryDensity();
  }

  async disableMemoryDensity(): ReturnType<ClusterSettingsSharedComponent['disableMemoryDensity']> {
    return this.clusterSettings.disableMemoryDensity();
  }

  async setMemoryDensityPercentage(
    ...args: Parameters<ClusterSettingsSharedComponent['setMemoryDensityPercentage']>
  ): ReturnType<ClusterSettingsSharedComponent['setMemoryDensityPercentage']> {
    return this.clusterSettings.setMemoryDensityPercentage(...args);
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

  async isConfigureFeaturesButtonVisible(): Promise<boolean> {
    try {
      const btn = this.locator('button:has-text("Configure features")');
      await btn.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }
}

export class VirtualizationFeaturesWizardComponent extends BaseComponent {
  private readonly _configureFeaturesBtn = this.locator('button:has-text("Configure features")');
  private readonly _highAvailabilitySummarySectionToggle = this.locator(
    '#high-availability-summary-section--toggle',
  );
  private readonly _wizardMain = this.locator('.pf-v6-c-wizard__main');

  private static readonly _EXPECTED_FEATURE_SUMMARY_TEXTS = [
    'Cluster observability',
    'Network observability',
    'Host network management (NMState)',
    'Node Health Check (NHC)',
    'Fence Agents Remediation (FAR)',
    'Load balance',
  ] as const;

  constructor(page: Page) {
    super(page);
  }

  async openConfigureFeaturesWizard() {
    await this._configureFeaturesBtn.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._configureFeaturesBtn);
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

  async clickHighAvailabilitySummarySectionToggle(): Promise<void> {
    await this._highAvailabilitySummarySectionToggle.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._highAvailabilitySummarySectionToggle);
  }

  async verifyFeatureSummaryItemsContainExpectedTexts(): Promise<boolean> {
    try {
      for (const expected of VirtualizationFeaturesWizardComponent._EXPECTED_FEATURE_SUMMARY_TEXTS) {
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
}
