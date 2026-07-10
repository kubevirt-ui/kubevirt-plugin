import BaseComponent from '@/components/shared/base-component';
import NavigationComponent from '@/components/shared/navigation-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class OverviewSettingsComponent extends BaseComponent {
  private readonly _advancedCDROMFeaturesBtn = this.locator(
    'button:has-text("Advanced CD-ROM features")',
  );

  private readonly _advancedCdromFeaturesToggle = this.locator(
    'input[data-test-id="advanced-cdrom-features"]',
  );
  private readonly _ariaWelcomeModal = this.locator('[aria-label="Welcome modal"]');
  private readonly _automaticImagesDownloadBtn = this.locator(
    'button:has-text("Automatic images download")',
  );
  private readonly _automaticSubscriptionBtn = this.locator(
    'button:has-text("Automatic subscription")',
  );
  private readonly _automaticSubscriptionTypeMainButton = this.locator(
    '.AutomaticSubscriptionType--main button',
  );
  private readonly _centosStream9ImageCronSwitch = this.locator(
    '[data-test-id="centos-stream9-image-cron-auto-image-download-switch"]',
  );
  private readonly _divIdAutoUpdateRhelVmsInputpfV6CSwitchInput = this.locator(
    'div[id="auto-update-rhel-vms"] input.pf-v6-c-switch__input',
  );
  private readonly _generalSettingsButton = this.locator('button:has-text("General settings")');
  private readonly _guestManagementButton = this.locator('button:has-text("Guest management")');
  private readonly _guestSystemLog = this.locator('[data-test-id="guest-system-log"]');
  private readonly _hideCredentials = this.locator('[data-test-id="hide-credentials"]');
  private readonly _idWelcomeModalCheckbox = this.locator('[id="welcome-modal-checkbox"]');
  private readonly _inputIdNodeAddress = this.locator('input[id="node-address"]');
  private readonly _kvTourPopoverKvTourPopoverHeader = this.locator(
    '.kv-tour-popover .kv-tour-popover__header',
  );
  private readonly _loadBalancerFeatureInputTypeCheckbox = this.locator(
    '#load-balancer-feature input[type="checkbox"]',
  );
  private readonly _loadBalancerServiceBtn = this.locator(
    'button:has-text("LoadBalancer service")',
  );
  private readonly _nodePortFeatureInputTypeCheckbox = this.locator(
    '#node-port-feature input[type="checkbox"]',
  );
  private readonly _passtUDNNetworkCheckbox = this.locator('[data-test-id="passtUDNNetwork"]');
  private readonly _pfV6CFormGroupsubscriptionLabel = this.locator(
    '.pf-v6-c-form__group.subscription-label',
  );
  private readonly _roleListbox = this.locator('[role="listbox"]');
  private readonly _sshConfigurationsButton = this.locator('button:has-text("SSH configurations")');

  private readonly _templatesAndImagesManagementBtn = this.locator(
    'button:has-text("Templates and images management")',
  );
  private readonly _treeViewFolders = this.locator('[data-test-id="treeViewFolders"]');
  private readonly _vmActionsConfirmationBtn = this.locator(
    'button:has-text("VirtualMachine actions confirmation")',
  );
  private readonly _vmActionsConfirmationToggle = this.locator(
    '[id="confirm-vm-actions"] [role="switch"]',
  );
  private readonly _vmTemplates = this.locator('[data-test-id="vmTemplates"]');
  private readonly _yAMLTabVisibilityBtn = this.locator('button:has-text("YAML tab visibility")');
  protected readonly nav = new NavigationComponent(this.page);

  constructor(page: Page) {
    super(page);
  }

  private async openSshConfigurations(): Promise<void> {
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

  private async waitForSuccessAlertVisible(): Promise<boolean> {
    const successAlert = this.locator('[role="alert"].pf-m-success');
    try {
      await successAlert.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return await successAlert.isVisible();
    } catch {
      return false;
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

  async closeGuidedTour(): Promise<void> {
    const closeButton = this.locator('.kv-tour-popover button[aria-label="Close"]');
    if (
      await closeButton.isVisible({ timeout: TestTimeouts.UI_ANIMATION_DELAY }).catch(() => false)
    ) {
      await closeButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_ANIMATION_DELAY);
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

  async disableVmTemplatesPreviewFeature(): Promise<boolean> {
    try {
      const toggle = this._vmTemplates;
      await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

      if (!(await toggle.isChecked())) {
        return true;
      }

      const patchPromise = this.page.waitForResponse(
        (resp) =>
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

  async dismissWelcomeModalCheckbox(timeout = TestTimeouts.UI_VISIBILITY_QUICK): Promise<void> {
    const welcomeModal = this._ariaWelcomeModal;
    const isVisible = await welcomeModal.isVisible().catch(() => false);
    if (isVisible) {
      const checkbox = this._idWelcomeModalCheckbox;
      await checkbox.waitFor({ state: 'visible', timeout });
      await checkbox.click({ force: true });
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

  async enableGuidedTour(): Promise<boolean> {
    try {
      const guidedTourSwitch = this.locator(
        ':has(:text("Guided tour")) :is(input[type="checkbox"], input[role="switch"], .pf-v6-c-switch__input)',
      );
      await guidedTourSwitch.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.DEFAULT,
      });
      await guidedTourSwitch.first().click({ force: true });
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

  async enableVmTemplatesPreviewFeature(): Promise<boolean> {
    try {
      const toggle = this._vmTemplates;
      await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

      if (await toggle.isChecked()) {
        return true;
      }

      const patchPromise = this.page.waitForResponse(
        (resp) =>
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

  async enableWelcomeInformation(): Promise<boolean> {
    try {
      const welcomeInfoSwitch = this.locator(
        ':has(:text("Welcome information")) :is(input[type="checkbox"], input[role="switch"], .pf-v6-c-switch__input)',
      );
      await welcomeInfoSwitch.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.DEFAULT,
      });
      await welcomeInfoSwitch.first().check({ force: true });
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);
      return true;
    } catch {
      return false;
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
      return texts.map((t) => t.trim()).filter(Boolean);
    } catch {
      return [];
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

  async isAdvancedCdromFeaturesEnabled(): Promise<boolean> {
    try {
      return await this._advancedCdromFeaturesToggle.isChecked().catch(() => false);
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

  async isWelcomeModalContentVisible(): Promise<boolean> {
    const bodyText = await this.page.textContent('body');
    return !!(bodyText && bodyText.includes('Do not show this again'));
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

  async navigateToGettingStartedResources(): Promise<boolean> {
    try {
      await this.navigateToSettings();

      const userTab = this.locator('[role="tab"]:has-text("User")');
      await userTab.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      await this.robustClick(userTab);

      const gettingStartedButton = this.locator('button:has-text("Getting started resources")');
      await gettingStartedButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.DEFAULT,
      });
      await this.robustClick(gettingStartedButton);
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);
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
        timeout: TestTimeouts.DEFAULT,
      });
      await this.robustClick(this._guestManagementButton);
      return true;
    } catch {
      return false;
    }
  }

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

  async navigateToSettings() {
    await this.navigateToSettingsViaSidebar();
  }

  async navigateToSettingsViaSidebar(): Promise<void> {
    try {
      await this.nav.clickNavSettings();
    } catch {
      await this.goTo('/k8s/all-namespaces/virtualization-settings');
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  async navigateToSettingsViaUI(): Promise<void> {
    await this.navigateToSettingsViaSidebar();
  }

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
          (resp) =>
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
      return true;
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

  async verifySettingsTabLoaded(): Promise<boolean> {
    try {
      const settingsText = this.locator('text=General settings');
      await settingsText.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return await settingsText.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyWelcomeInformationUnchecked(): Promise<boolean> {
    try {
      const welcomeInfoSwitch = this.locator(
        ':has(:text("Welcome information")) :is(input[type="checkbox"], input[role="switch"], .pf-v6-c-switch__input)',
      );
      await welcomeInfoSwitch.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.DEFAULT,
      });
      const isChecked = await welcomeInfoSwitch.first().isChecked();
      return !isChecked;
    } catch {
      return false;
    }
  }

  async verifyWelcomeModalCreateFlow(timeout = TestTimeouts.UI_VISIBILITY_QUICK): Promise<{
    subtitleVisible: boolean;
    fedoraVisible: boolean;
  }> {
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
}
