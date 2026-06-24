import BaseComponent from '@/components/shared/base-component';
import NavigationComponent from '@/components/shared/navigation-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export class OverviewSettingsBaseComponent extends BaseComponent {
  protected readonly _loadBalancerServiceBtn = this.locator(
    'button:has-text("LoadBalancer service")',
  );
  protected readonly _loadBalancerFeatureInputTypeCheckbox = this.locator(
    '#load-balancer-feature input[type="checkbox"]',
  );
  protected readonly _inputIdNodeAddress = this.locator('input[id="node-address"]');
  protected readonly _nodePortFeatureInputTypeCheckbox = this.locator(
    '#node-port-feature input[type="checkbox"]',
  );
  protected readonly _guestSystemLog = this.locator('[data-test-id="guest-system-log"]');
  protected readonly _yAMLTabVisibilityBtn = this.locator('button:has-text("YAML tab visibility")');
  protected readonly _hideCredentials = this.locator('[data-test-id="hide-credentials"]');
  protected readonly _automaticSubscriptionBtn = this.locator(
    'button:has-text("Automatic subscription")',
  );
  protected readonly _automaticSubscriptionTypeMainButton = this.locator(
    '.AutomaticSubscriptionType--main button',
  );
  protected readonly _roleListbox = this.locator('[role="listbox"]');
  protected readonly _pfV6CFormGroupsubscriptionLabel = this.locator(
    '.pf-v6-c-form__group.subscription-label',
  );
  protected readonly _divIdAutoUpdateRhelVmsInputpfV6CSwitchInput = this.locator(
    'div[id="auto-update-rhel-vms"] input.pf-v6-c-switch__input',
  );
  protected readonly _vmTemplates = this.locator('[data-test-id="vmTemplates"]');
  protected readonly _treeViewFolders = this.locator('[data-test-id="treeViewFolders"]');
  protected readonly _templatesAndImagesManagementBtn = this.locator(
    'button:has-text("Templates and images management")',
  );
  protected readonly _automaticImagesDownloadBtn = this.locator(
    'button:has-text("Automatic images download")',
  );
  protected readonly _kvTourPopoverKvTourPopoverHeader = this.locator(
    '.kv-tour-popover .kv-tour-popover__header',
  );
  protected readonly _ariaWelcomeModal = this.locator('[aria-label="Welcome modal"]');
  protected readonly _advancedCDROMFeaturesBtn = this.locator(
    'button:has-text("Advanced CD-ROM features")',
  );
  protected readonly _idWelcomeModalCheckbox = this.locator('[id="welcome-modal-checkbox"]');
  protected readonly _generalSettingsButton = this.locator('button:has-text("General settings")');

  protected readonly _centosStream9ImageCronSwitch = this.locator(
    '[data-test-id="centos-stream9-image-cron-auto-image-download-switch"]',
  );
  protected readonly _advancedCdromFeaturesToggle = this.locator(
    'input[data-test-id="advanced-cdrom-features"]',
  );
  protected readonly _sshConfigurationsButton = this.locator(
    'button:has-text("SSH configurations")',
  );
  protected readonly _guestManagementButton = this.locator('button:has-text("Guest management")');
  protected readonly _passtUDNNetworkCheckbox = this.locator('[data-test-id="passtUDNNetwork"]');
  protected readonly _vmActionsConfirmationBtn = this.locator(
    'button:has-text("VirtualMachine actions confirmation")',
  );
  protected readonly _vmActionsConfirmationToggle = this.locator(
    '[id="confirm-vm-actions"] [role="switch"]',
  );
  protected readonly _userTab = this.page.getByRole('tab', { exact: true, name: 'User' });
  protected readonly _userGeneralSection = this.page
    .getByRole('button')
    .filter({ hasText: 'General' });
  protected readonly _autoHideNavToggle = this.locator('[data-test-id="auto-hide-nav"]');

  constructor(page: Page) {
    super(page);
  }

  async navigateToSettings() {
    await this.navigateToSettingsViaSidebar();
  }

  async navigateToSettingsViaUI(): Promise<void> {
    await this.navigateToSettingsViaSidebar();
  }

  async navigateToSettingsViaSidebar(): Promise<void> {
    try {
      const nav = new NavigationComponent(this.page);
      await nav.clickNavSettings();
    } catch {
      await this.goTo('/k8s/all-namespaces/virtualization-settings');
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  async fillConfigurationSearchInput(
    searchTerm: string,
    expectedResult?: string,
    waitTimeout: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<void> {
    const configurationSearchInput = this.locator('#ConfigurationSearch-autocomplete-search input');
    await configurationSearchInput.waitFor({
      state: 'visible',
      timeout: waitTimeout,
    });
    await configurationSearchInput.clear();
    await configurationSearchInput.fill(searchTerm);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    if (expectedResult) {
      await this.clickSearchResultMenuItem(expectedResult, waitTimeout);
    }
  }

  async verifyHighlightedSearchResultsVisible(
    waitTimeout: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<{ isVisible: boolean; count: number }> {
    const searchMenuItems = this.locator('[role="menuitem"]');
    try {
      await searchMenuItems.first().waitFor({ state: 'visible', timeout: waitTimeout });
      const count = await searchMenuItems.count();
      const firstResultVisible = await searchMenuItems
        .first()
        .isVisible()
        .catch(() => false);
      return { isVisible: firstResultVisible && count > 0, count };
    } catch {
      const count = await searchMenuItems.count().catch(() => 0);
      return { isVisible: false, count };
    }
  }

  async clickSearchResultMenuItem(
    searchText: string,
    waitTimeout: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<void> {
    const searchResultMenuItem = this.locator('[role="menuitem"]');
    await searchResultMenuItem.first().waitFor({ state: 'visible', timeout: waitTimeout });
    const matchingMenuItem = searchResultMenuItem.filter({ hasText: searchText }).first();
    await matchingMenuItem.waitFor({
      state: 'visible',
      timeout: waitTimeout,
    });
    await this.robustClick(matchingMenuItem);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async verifySettingsTabLoaded(): Promise<boolean> {
    try {
      const settingsText = this.locator('text=General settings');
      await settingsText.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return await settingsText.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async getSettingsTabNames(): Promise<string[]> {
    const settingsTablist = this.page
      .getByRole('tablist')
      .filter({ has: this.page.getByRole('tab', { name: 'Preview features' }) });
    await settingsTablist.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    const tabs = settingsTablist.getByRole('tab');
    return await tabs.allTextContents();
  }

  async getGeneralSettingsSubSections(): Promise<string[]> {
    const knownSubSections = [
      'Live migration',
      'Memory density',
      'SSH configurations',
      'Templates and images management',
      'VirtualMachine actions confirmation',
      'YAML tab visibility',
      'Advanced CD-ROM features',
    ];
    const found: string[] = [];
    for (const sub of knownSubSections) {
      const btn = this.locator(`button:has-text("${sub}")`).first();
      const visible = await btn
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK })
        .then(() => true)
        .catch(() => false);
      if (visible) {
        found.push(sub);
      }
    }
    return found;
  }

  async navigateToUserTabGeneralSection(): Promise<void> {
    await this._userTab.click();
    await this._userGeneralSection.waitFor({
      state: 'visible',
      timeout: TestTimeouts.NAVIGATION,
    });
    const expanded = await this._userGeneralSection
      .evaluate((el) => el.getAttribute('aria-expanded') === 'true')
      .catch(() => false);
    if (!expanded) {
      await this._userGeneralSection.click();
    }
  }

  async setAutoHideNavigation(enabled: boolean): Promise<boolean> {
    try {
      const isVisible = await this._autoHideNavToggle
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false);
      if (!isVisible) {
        await this.navigateToUserTabGeneralSection();
      }
      await this._autoHideNavToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      const current = await this._autoHideNavToggle.isChecked().catch(() => false);
      if (current !== enabled) {
        const patchDone = this.page.waitForResponse(
          (r) =>
            r.url().includes('configmaps/kubevirt-user-settings') &&
            r.request().method() === 'PATCH',
          { timeout: TestTimeouts.NAVIGATION },
        );
        await this._autoHideNavToggle.setChecked(enabled, { force: true });
        await patchDone;
      }
      return enabled;
    } catch {
      return false;
    }
  }

  async getAutoHideNavigationState(): Promise<boolean> {
    try {
      const isVisible = await this._autoHideNavToggle
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false);
      if (!isVisible) {
        await this.navigateToUserTabGeneralSection();
      }
      await this._autoHideNavToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this._autoHideNavToggle.isChecked();
    } catch {
      return false;
    }
  }

  // --- Inlined from applyLiveMigrationDelegations ---

  async openSshConfigurations(): Promise<void> {
    await this._generalSettingsButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_VISIBILITY_QUICK,
    });
    await this.robustClick(this._generalSettingsButton);

    await this._sshConfigurationsButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_VISIBILITY_QUICK,
    });
    await this.robustClick(this._sshConfigurationsButton);
  }

  async enableSSHUsingLoadBalancer(): Promise<boolean> {
    try {
      await this.navigateToSettings();
      await this.openSshConfigurations();

      await this._loadBalancerServiceBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await this.robustClick(this._loadBalancerServiceBtn);

      await this._loadBalancerFeatureInputTypeCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await this._loadBalancerFeatureInputTypeCheckbox.check({ force: true });

      return true;
    } catch {
      return false;
    }
  }

  async enableSSHOverNodePort(nodeAddress?: string): Promise<boolean> {
    try {
      await this.navigateToSettings();
      await this.openSshConfigurations();

      if (nodeAddress) {
        await this._inputIdNodeAddress.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_VISIBILITY_QUICK,
        });
        await this._inputIdNodeAddress.clear();
        await this._inputIdNodeAddress.fill(nodeAddress);
      }

      await this._nodePortFeatureInputTypeCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await this._nodePortFeatureInputTypeCheckbox.click({ force: true });
      return true;
    } catch {
      return false;
    }
  }

  async setGuestSystemLog(enabled: boolean): Promise<boolean> {
    try {
      const isCheckboxVisible = await this._guestSystemLog
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false);

      if (!isCheckboxVisible) {
        await this._guestManagementButton.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        await this.robustClick(this._guestManagementButton);
      }

      await this._guestSystemLog.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      const isCurrentlyEnabled = await this._guestSystemLog.isChecked().catch(() => false);

      if (isCurrentlyEnabled !== enabled) {
        await this._guestSystemLog.click({ force: true });
      }

      return true;
    } catch {
      return false;
    }
  }

  async setHideYamlTab(enabled: boolean): Promise<boolean> {
    try {
      const toggleLocator = this.locator('[data-test-id="hide-yaml-tab"]');

      const isCheckboxVisible = await toggleLocator
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false);

      if (!isCheckboxVisible) {
        await this._yAMLTabVisibilityBtn.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        await this.robustClick(this._yAMLTabVisibilityBtn);
      }

      await toggleLocator.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      await this.page.waitForTimeout(TestTimeouts.POLLING_INTERVAL);
      const isCurrentlyEnabled = await toggleLocator.isChecked().catch(() => false);

      if (isCurrentlyEnabled !== enabled) {
        const patchPromise = this.page.waitForResponse(
          (resp: {
            url: () => string;
            request: () => { method: () => string };
            status: () => number;
          }) =>
            resp.url().includes('kubevirt-ui-features') &&
            (resp.request().method() === 'PATCH' || resp.request().method() === 'PUT') &&
            resp.status() >= 200 &&
            resp.status() < 300,
          { timeout: TestTimeouts.DEFAULT },
        );
        await toggleLocator.click({ force: true });
        await patchPromise;

        for (let i = 0; i < 10; i++) {
          const state = await toggleLocator.isChecked().catch(() => !enabled);
          if (state === enabled) break;
          await this.page.waitForTimeout(500);
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  async hideGuestCredentials(enabled: boolean): Promise<boolean> {
    try {
      const isCheckboxVisible = await this._hideCredentials
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false);

      if (!isCheckboxVisible) {
        await this._guestManagementButton.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        await this.robustClick(this._guestManagementButton);
      }

      await this._hideCredentials.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      const isCurrentlyEnabled = await this._hideCredentials.isChecked().catch(() => false);

      if (isCurrentlyEnabled !== enabled) {
        await this._hideCredentials.click({ force: true });
      }

      return true;
    } catch {
      return false;
    }
  }

  async navigateToGuestManagement(): Promise<boolean> {
    try {
      await this.navigateToSettings();
      await this._guestManagementButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
      await this.robustClick(this._guestManagementButton);
      return true;
    } catch {
      return false;
    }
  }

  async navigateToAutomaticSubscription(): Promise<boolean> {
    try {
      await this.navigateToGuestManagement();
      await this._automaticSubscriptionBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(this._automaticSubscriptionBtn);
      return true;
    } catch {
      return false;
    }
  }

  async fillActivationKey(organizationId: string, activationKey: string): Promise<boolean> {
    try {
      await this._automaticSubscriptionTypeMainButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this.robustClick(this._automaticSubscriptionTypeMainButton);

      await this._roleListbox.locator('text=Monitor and manage subscriptions').waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this.robustClick(this._roleListbox.locator('text=Monitor and manage subscriptions'));

      await this._pfV6CFormGroupsubscriptionLabel.nth(1).locator('input[type="text"]').waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this._pfV6CFormGroupsubscriptionLabel.nth(1).locator('input[type="text"]').clear();
      await this._pfV6CFormGroupsubscriptionLabel
        .nth(1)
        .locator('input[type="text"]')
        .fill(organizationId);

      await this._pfV6CFormGroupsubscriptionLabel.nth(0).locator('input[type="text"]').waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this._pfV6CFormGroupsubscriptionLabel.nth(0).locator('input[type="text"]').clear();
      await this._pfV6CFormGroupsubscriptionLabel
        .nth(0)
        .locator('input[type="text"]')
        .fill(activationKey);

      const orgIdLabel = this.locator('text=Organization ID');
      await orgIdLabel
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_FILTER_APPLY })
        .catch(() => {
          return;
        });
      await orgIdLabel.click().catch(() => {
        return;
      });

      await this._divIdAutoUpdateRhelVmsInputpfV6CSwitchInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.VM_CREATION,
      });
      await this._divIdAutoUpdateRhelVmsInputpfV6CSwitchInput.click({
        force: true,
      });

      return true;
    } catch {
      return false;
    }
  }
}
