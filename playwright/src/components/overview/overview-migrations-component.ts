import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import { waitForCondition } from '@/utils/wait-helpers';
import type { Page } from '@playwright/test';

export default class OverviewMigrationsComponent extends BaseComponent {
  private readonly _generalSettingsButton = this.locator('button:has-text("General settings")');
  private readonly _inputSliderValueInput = this.locator('input[aria-label="Slider value input"]');
  private readonly _memoryDensityBtn = this.locator('button:has-text("Memory density")');
  private readonly _memoryDensityDisableConfirmButton = this.testId(
    'memory-density-disable-confirm-button',
  );
  private readonly _memoryDensityModifyButtonButton = this.testId(
    'memory-density-modify-button',
  ).locator('button');
  private readonly _memoryDensitySaveButton = this.testId('memory-density-save-button');
  private readonly _memoryDensityToggle = this.locator('#memory-density-feature input');
  private readonly _migrationStatusSection = this.locator('#migration-status-section');
  private readonly _overviewTab = this.testId('overview-tab');
  private readonly _pfV6CPopoverContent = this.locator('.pf-v6-c-popover__content');

  constructor(page: Page) {
    super(page);
  }

  async clickLastButton() {
    const lastButton = this.locator('button:has-text("Last")');
    await lastButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(lastButton);
  }

  async clickLimitationsLink() {
    const limitationsLink = this.locator('a:has-text("Limitations")');
    await limitationsLink.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(limitationsLink);
  }

  async clickTimeRangeButton(timeRange: string) {
    const menuItem = this.locator(
      `[role="menuitem"]:has-text("${timeRange}"), [role="option"]:has-text("${timeRange}")`,
    );
    const fallback = this.locator(`button:has-text("${timeRange}")`).last();

    const target = (await menuItem.count()) > 0 ? menuItem.first() : fallback;
    await target.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(target);
  }

  async clickVmimNameLink(): Promise<string | null> {
    try {
      const section = this._migrationStatusSection;
      const viewAllLink = section.locator('a').filter({ hasText: 'View all' }).first();
      await viewAllLink.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

      await this.robustClick(viewAllLink);

      return 'migrations-list';
    } catch {
      return null;
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

  async getMigrationStatus(vmName: string): Promise<string | null> {
    try {
      const vmRow = this.locator(`tr:has-text("${vmName}")`);
      await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

      const statusCell = vmRow.locator('td:nth-child(3)');
      await statusCell.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      const statusText = await statusCell.textContent();
      return statusText?.trim() || null;
    } catch {
      return null;
    }
  }

  async hasMonitoringError(): Promise<boolean> {
    try {
      const errorText = this.locator('text=Model does not exist');
      const errorOccurred = this.locator('text=An error occurred');

      const hasModelError = await errorText
        .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
        .catch(() => false);
      const hasError = await errorOccurred
        .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
        .catch(() => false);

      return hasModelError || hasError;
    } catch {
      return false;
    }
  }

  async navigateToMigrations() {
    await this.goTo('/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine');
    await this.page.waitForLoadState('domcontentloaded');
    const overviewTab = this._overviewTab;
    const tabVisible = await overviewTab
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .then(() => true)
      .catch(() => false);
    if (tabVisible) {
      await this.robustClick(overviewTab);
    }
  }

  async navigateToStandaloneMigrationsPage(): Promise<void> {
    await this.goTo('/k8s/all-namespaces/virtualization-migrations');
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

  async selectMigrationsTimeFilter(_timeFilter = '1h') {
    const section = this.testId('migration-status-section');
    await section
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => undefined);
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

      const versionEl = this.testId('general-information-installed-version');
      const statusEl = this.testId('general-information-update-status');

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

  async verifyLiveMigrationSettings(): Promise<boolean> {
    try {
      const popoverContent = this._pfV6CPopoverContent;
      await popoverContent.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      const liveMigrationSettings = popoverContent.locator(
        'h3:has-text("Live migrations settings")',
      );
      return await liveMigrationSettings.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyMigrationSetting(settingLabel: string, expectedValue: string): Promise<boolean> {
    try {
      const popoverContent = this._pfV6CPopoverContent;
      await popoverContent.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      const stackItem = popoverContent.locator(
        `.pf-v6-l-stack__item:has(b:has-text("${settingLabel}"))`,
      );
      await stackItem.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

      const valueDiv = stackItem.locator('div');
      const actualValue = await valueDiv.textContent();

      return actualValue?.trim() === expectedValue?.trim();
    } catch {
      return false;
    }
  }

  async verifyMigrationsTabLoaded(): Promise<boolean> {
    try {
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);

      const migrationByDataTest = this.testId('migration-status-section').or(
        this.testId('migrations-widget'),
      );
      const migrationByText = this.page.getByText('Migration statuses');
      const migrationByTab = this.testId('horizontal-link-Migrations').and(
        this.locator('.pf-m-current'),
      );

      const dataTestVisible = await migrationByDataTest
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
        .then(() => true)
        .catch(() => false);
      if (dataTestVisible) return true;

      const textVisible = await migrationByText
        .first()
        .isVisible()
        .catch(() => false);
      if (textVisible) return true;

      return await migrationByTab
        .first()
        .isVisible()
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyMigrationStatusSectionVisible(): Promise<boolean> {
    try {
      const section = this._migrationStatusSection;
      await section.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }

  async verifyStandaloneMigrationsPageLoaded(timeout = TestTimeouts.DEFAULT): Promise<boolean> {
    try {
      const title = this.page.getByText('Compute migrations', { exact: false });
      const titleVisible = await title
        .first()
        .waitFor({ state: 'visible', timeout })
        .then(() => true)
        .catch(() => false);
      if (titleVisible) return true;

      const overviewSection = this.page.getByText('Compute migration overview');
      return await overviewSection
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
        .then(() => true)
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyVmimDetailPage(): Promise<boolean> {
    try {
      await this.locator(
        '[data-test-section-heading="VirtualMachineInstanceMigration details"]',
      ).waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this.locator(
        '[data-test-section-heading="VirtualMachineInstanceMigration details"]',
      )
        .isVisible()
        .catch(() => false);
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
