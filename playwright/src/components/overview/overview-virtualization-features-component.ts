import BaseComponent from '@/components/shared/base-component';
import OverviewSettingsPage from '@/page-objects/overview/overview-settings-page';
import { TestTimeouts } from '@/utils/test-config';
import { waitForCondition } from '@/utils/wait-helpers';
import type { Page } from '@playwright/test';

export default class OverviewVirtualizationFeaturesComponent extends BaseComponent {
  private readonly _aaqSwitch = this.locator(
    '.section-with-switch:has-text("Application Aware Quota") .pf-v6-c-switch input',
  );
  private readonly _generalSettingsButton = this.locator('button:has-text("General settings")');
  private readonly _inputSliderValueInput = this.locator('input[aria-label="Slider value input"]');
  private readonly _ksmCheckbox = this.testId('kernel-samepage-merging');
  private readonly _memoryDensityBtn = this.locator('button:has-text("Memory density")');
  private readonly _memoryDensityDisableConfirmButton = this.testId(
    'memory-density-disable-confirm-button',
  );
  private readonly _memoryDensityModifyButtonButton = this.testId(
    'memory-density-modify-button',
  ).locator('button');
  private readonly _memoryDensitySaveButton = this.testId('memory-density-save-button');
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
  private readonly _persistentReservationCheckbox = this.testId('persistent-reservation');
  private readonly _resourceManagementBtn = this.locator('button:has-text("Resource management")');
  private readonly _sCSIPersistentReservationBtn = this.locator(
    'button:has-text("SCSI persistent reservation")',
  );

  private readonly _userButton = this.locator('button[role="tab"]', {
    hasText: 'User',
  });

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
        if (await btn.isDisabled()) break;
        const before = await this._memoryRequestRatioInput.inputValue();
        await this.robustClick(btn);
        await waitForCondition(
          async () => (await this._memoryRequestRatioInput.inputValue()) !== before,
          TestTimeouts.UI_ACTION_COMPLETE,
          TestTimeouts.POLLING_INTERVAL,
        );
      }
      return true;
    } catch {
      return false;
    }
  }

  async disableAaq(): Promise<boolean> {
    try {
      const alreadyDisabled = !(await this.isAaqEnabled());
      if (alreadyDisabled) return true;
      await this._aaqSwitch.first().click({ force: true });
      await this.page.waitForTimeout(TestTimeouts.CLUSTER_STATE_PROPAGATION);
      return !(await this.isAaqEnabled());
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

  async getClusterSettingsSectionNames(): Promise<string[]> {
    const knownSections = [
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
