import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class VmListEmptyStateComponent extends BaseComponent {
  private static readonly _USER_SETTINGS_URL =
    '**/api/kubernetes/api/v1/namespaces/openshift-cnv/configmaps/kubevirt-user-settings';

  private static readonly _VM_LIST_PATH = '/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine';

  constructor(page: Page) {
    super(page);
  }

  async isNoVMsMessageVisible(): Promise<boolean> {
    try {
      const noVMsMessage = this.locator(
        'h2:has-text("VirtualMachines yet"), .pf-v6-c-empty-state__title:has-text("VirtualMachines yet"), .pf-v6-c-empty-state__title:has-text("No virtual machines")',
      );
      await noVMsMessage.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async isNoVMsMessageNotVisible(): Promise<boolean> {
    const noVMsMessage = this.locator('text=No VirtualMachines found');
    return !(await noVMsMessage.isVisible().catch(() => false));
  }

  async getEmptyStateBodyText(): Promise<string> {
    try {
      const body = this.locator('.pf-v6-c-empty-state__body');
      await body.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      return (await body.allTextContents()).join(' ');
    } catch {
      return '';
    }
  }

  async isEmptyStateCreateButtonVisible(): Promise<boolean> {
    try {
      const btn = this.locator('.pf-v6-c-empty-state [data-test="item-create"]');
      await btn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async isProjectHintVisible(timeout: number = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    try {
      const hint = this.page.getByText("Don't have a project yet?");
      await hint.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async mockProjectCreatePermission(allowed: boolean): Promise<void> {
    await this.page.route(
      '**/apis/authorization.k8s.io/v1/selfsubjectaccessreviews',
      async (route) => {
        const request = route.request();
        if (request.method() !== 'POST') {
          await route.fallback();
          return;
        }

        let body: null | Record<string, unknown> = null;
        try {
          body = JSON.parse(request.postData() || '{}') as Record<string, unknown>;
        } catch {
          await route.fallback();
          return;
        }

        const spec = (body?.spec as Record<string, unknown>) || {};
        const resourceAttrs =
          (spec.resourceAttributes as Record<string, string>) ||
          (spec.nonResourceAttributes as Record<string, string>);

        if (resourceAttrs?.resource === 'projectrequests' && resourceAttrs?.verb === 'create') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              apiVersion: 'authorization.k8s.io/v1',
              kind: 'SelfSubjectAccessReview',
              status: { allowed },
            }),
          });
          return;
        }

        await route.fallback();
      },
    );
  }

  async clearEmptyStateMocks(): Promise<void> {
    await this.page.unrouteAll();
  }

  async mockConsoleGuidedTourIncomplete(username = 'kubeadmin'): Promise<void> {
    const configMapUrl = `**/api/kubernetes/api/v1/namespaces/openshift-console-user-settings/configmaps/user-settings-${username}`;
    const guidedTour = {
      admin: { completed: false },
      dev: { completed: false },
      'virtualization-perspective': { completed: false },
    };
    const configMapBody = {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: {
        name: `user-settings-${username}`,
        namespace: 'openshift-console-user-settings',
      },
      data: {
        'console.guidedTour': JSON.stringify(guidedTour),
      },
    };

    await this.page.route(configMapUrl, async (route) => {
      const method = route.request().method();
      if (method === 'GET' || method === 'PATCH') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(configMapBody),
        });
        return;
      }
      await route.fallback();
    });
  }

  async mockUserSettings(settings: Record<string, unknown>): Promise<void> {
    const configMapUrl = VmListEmptyStateComponent._USER_SETTINGS_URL;

    await this.page.unroute(configMapUrl);

    const serialized = JSON.stringify(settings);

    await this.page.route(configMapUrl, async (route) => {
      const method = route.request().method();
      if (method === 'GET' || method === 'PATCH') {
        const real = await route.fetch();
        let body: Record<string, unknown> = {};
        try {
          body = await real.json();
        } catch {
          body = {
            apiVersion: 'v1',
            kind: 'ConfigMap',
            metadata: { name: 'kubevirt-user-settings', namespace: 'openshift-cnv' },
            data: {},
          };
        }
        const existingData = (body['data'] as Record<string, string>) ?? {};
        const patchedData: Record<string, string> = {};
        for (const key of Object.keys(existingData)) {
          patchedData[key] = serialized;
        }
        if (Object.keys(patchedData).length === 0) {
          patchedData['kube-admin'] = serialized;
        }
        body['data'] = patchedData;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(body),
        });
        return;
      }
      await route.fallback();
    });
  }

  async mockUserSettingsAndNavigate(settings: Record<string, unknown>): Promise<void> {
    await this.mockUserSettings(settings);
    await this.goTo(VmListEmptyStateComponent._VM_LIST_PATH);
  }

  async isGuidedTourPopoverVisible(
    timeout: number = TestTimeouts.UI_VISIBILITY_QUICK,
  ): Promise<boolean> {
    try {
      const tourPopover = this.locator('.kv-tour-popover');
      await tourPopover.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async isOnboardingPopoverVisible(
    timeout: number = TestTimeouts.UI_VISIBILITY_QUICK,
  ): Promise<boolean> {
    try {
      const popover = this.page.locator('.pf-v6-c-popover:has(button:has-text("Got it"))');
      await popover.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async getOnboardingPopoverHeaderText(): Promise<string> {
    try {
      const header = this.page.locator('.pf-v6-c-popover__title-text');
      await header.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      return (await header.textContent())?.trim() ?? '';
    } catch {
      return '';
    }
  }
}

export class VmListMigrationComponent extends BaseComponent {
  private readonly _migrationModal = this.locator('#virtual-machine-migration-modal');
  private readonly _migrationMenuItem = this.locator('[data-test-id="migration-menu"]');
  private readonly _specificNodeCheckbox = this.locator('#manual-migration-option-selection');
  private readonly _nodeSearchInput = this.locator('input[placeholder="Search node"]');
  private readonly _btnPlaceholderSelectStorageClass = this.locator(
    'button[placeholder="Select StorageClass"]',
  );
  private readonly _migrateStorageAction = this.locator(
    '[data-test-id="vm-action-migrate-storage"]',
  );
  private readonly _inputIdSelectedVolumes = this.locator('input[id="selected-volumes"]');
  private readonly _selectAllRows = this.locator('[aria-label="Select all rows"]');
  private readonly _migrateVirtualMachineBtn = this.locator(
    'button:has-text("Migrate VirtualMachine")',
  );
  private readonly _buttonpfV6CButtonpfMPrimary = this.locator(
    'button.pf-v6-c-button.pf-m-primary',
  );
  private readonly _buttonpfV6CButtonpfMSecondary = this.locator(
    'button.pf-v6-c-button.pf-m-secondary',
  );
  private readonly _vmActionMigrateCompute = this.locator(
    '[data-test-id="vm-action-migrate-compute"]',
  );

  constructor(page: Page, private readonly openVmRowActions: (vmName: string) => Promise<void>) {
    super(page);
  }

  async clickBulkMigrateStorage(): Promise<void> {
    await this.robustClick(this.locator('[data-test-id="vms-bulk-migrate-storage"]'));
  }

  async performBulkStorageClassMigration(destinationStorageClass: string): Promise<boolean> {
    try {
      await this.clickBulkMigrateStorage();

      const migrationModal = this.locator('#virtual-machine-migration-modal');
      await migrationModal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

      const nextButton = this._buttonpfV6CButtonpfMPrimary;
      await nextButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

      const backButton = this._buttonpfV6CButtonpfMSecondary;
      await backButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      await nextButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

      const selectSCButton = this._btnPlaceholderSelectStorageClass;
      await selectSCButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const scOption = this.locator(`button#select-inline-filter-${destinationStorageClass}`);
      await scOption.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      await nextButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

      await nextButton.click();

      const inProgress = this.locator('text=In progress');
      await inProgress.waitFor({ state: 'visible', timeout: TestTimeouts.BULK_VM_OPERATION });

      const completed = migrationModal.locator('text=Migration completed successfully');
      await completed.waitFor({ state: 'visible', timeout: TestTimeouts.MIGRATION_COMPLETION });

      const closeButton = this.locator('.pf-v6-c-wizard__close');
      await closeButton.click();

      return true;
    } catch {
      return false;
    }
  }

  async completeMigrationWizardWithStorageClass(
    destinationStorageClass: string,
    migrationCompletionTimeoutMs: number = TestTimeouts.MIGRATION_COMPLETION,
    keepOriginalVolumes = false,
  ): Promise<boolean> {
    try {
      const migrationModal = this.locator('#virtual-machine-migration-modal');
      const nextButton = this._buttonpfV6CButtonpfMPrimary;

      await nextButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

      const selectSCButton = this._btnPlaceholderSelectStorageClass;
      await selectSCButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(selectSCButton);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const scOption = this.locator(`button#select-inline-filter-${destinationStorageClass}`);
      await scOption.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(scOption);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const keepVolumesCheckbox = migrationModal.locator('#keep-original-volumes');
      const isChecked = await keepVolumesCheckbox.isChecked();
      if (keepOriginalVolumes !== isChecked) {
        await keepVolumesCheckbox.click({ force: true });
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }

      await nextButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

      await nextButton.click();

      const inProgress = migrationModal.locator('text=In progress').first();
      await inProgress.waitFor({ state: 'visible', timeout: TestTimeouts.BULK_VM_OPERATION });

      const completed = migrationModal.locator('text=Storage migration completed').first();
      await completed.waitFor({ state: 'visible', timeout: migrationCompletionTimeoutMs });

      const closeButton = this.locator('[id="virtual-machine-migration-modal"] button', {
        hasText: 'Close',
      });
      await closeButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(closeButton);

      return true;
    } catch {
      try {
        const cancelOrClose = this.locator(
          '#virtual-machine-migration-modal button:has-text("Cancel"), #virtual-machine-migration-modal button:has-text("Close"), .pf-v6-c-wizard__close',
        ).first();
        if (
          await cancelOrClose.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false)
        ) {
          await this.robustClick(cancelOrClose);
          await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
        }
      } catch {
        /* best-effort modal cleanup */
      }
      return false;
    }
  }

  async performStorageClassMigration(
    vmName: string,
    destinationStorageClass: string,
    selectedVolumes = false,
    migrationCompletionTimeoutMs: number = TestTimeouts.MIGRATION_COMPLETION,
    keepOriginalVolumes = false,
  ): Promise<boolean> {
    try {
      await this.openVmRowActions(vmName);

      const migrationMenu = this.locator('[data-test-id="migration-menu"]');
      await migrationMenu.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(migrationMenu);

      const migrateStorage = this._migrateStorageAction;
      await migrateStorage.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(migrateStorage);

      const migrationModal = this.locator('#virtual-machine-migration-modal');
      await migrationModal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

      if (selectedVolumes) {
        const selectedVolumesOption = this._inputIdSelectedVolumes;
        await selectedVolumesOption.waitFor({
          state: 'visible',
          timeout: TestTimeouts.ELEMENT_WAIT,
        });
        await selectedVolumesOption.click();
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

        const selectAllRows = this._selectAllRows;
        await selectAllRows.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
        await selectAllRows.click({ force: true });
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }

      const nextButton = this._buttonpfV6CButtonpfMPrimary;
      await nextButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

      const backButton = this._buttonpfV6CButtonpfMSecondary;
      await backButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      await nextButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

      await backButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      return await this.completeMigrationWizardWithStorageClass(
        destinationStorageClass,
        migrationCompletionTimeoutMs,
        keepOriginalVolumes,
      );
    } catch {
      return false;
    }
  }

  async openStorageMigrationModal(vmName: string, assertNextEnabled = true): Promise<void> {
    await this.openVmRowActions(vmName);
    const migrationMenu = this.locator('[data-test-id="migration-menu"]');
    await migrationMenu.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(migrationMenu);

    const migrateStorage = this._migrateStorageAction;
    await migrateStorage.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(migrateStorage);

    await this._migrationModal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    const nextButton = this._migrationModal.locator('button.pf-v6-c-button.pf-m-primary');
    await nextButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    if (assertNextEnabled) {
      await expect(nextButton).toBeEnabled({ timeout: TestTimeouts.DEFAULT });
    }
  }

  async isWizardNavStepDisabled(stepName: string): Promise<boolean> {
    const navLink = this._migrationModal
      .locator('.pf-v6-c-wizard__nav-link')
      .filter({ hasText: stepName });
    await navLink.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    return await navLink.isDisabled();
  }

  async clickSelectedVolumesRadio(): Promise<void> {
    const selectedVolumesOption = this._inputIdSelectedVolumes;
    await selectedVolumesOption.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await selectedVolumesOption.click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async selectAllVolumesInMigrationModal(): Promise<void> {
    const selectAllRows = this._selectAllRows;
    await selectAllRows.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await selectAllRows.click({ force: true });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async closeMigrationModal(): Promise<void> {
    const closeButton = this._migrationModal.locator('.pf-v6-c-wizard__close');
    await closeButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(closeButton);
    await this._migrationModal.waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async startStorageMigrationAndCancelWhileInProgress(vmName: string): Promise<void> {
    await this.openVmRowActions(vmName);

    const migrationMenu = this.locator('[data-test-id="migration-menu"]');
    await migrationMenu.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(migrationMenu);

    const migrateStorage = this._migrateStorageAction;
    await migrateStorage.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(migrateStorage);

    await this._migrationModal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    const nextButton = this._buttonpfV6CButtonpfMPrimary;

    await nextButton.click();
    await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

    const selectSCButton = this._migrationModal.locator(
      'button.pf-v6-c-menu-toggle.pf-m-full-width',
    );
    await selectSCButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(selectSCButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const allScOptions = this.locator('button[id^="select-inline-filter-"]');
    await allScOptions.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    const count = await allScOptions.count();

    let validScFound = false;
    for (let i = 0; i < count; i++) {
      await this.robustClick(allScOptions.nth(i));
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const enabled = await nextButton
        .isEnabled({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);
      if (enabled) {
        validScFound = true;
        break;
      }

      await this.robustClick(selectSCButton);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    if (!validScFound) {
      throw new Error(
        'startStorageMigrationAndCancelWhileInProgress: all available StorageClasses match the source — cannot start migration',
      );
    }

    await nextButton.click();
    await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

    await nextButton.click();

    const inProgress = this._migrationModal.locator('text=In progress').first();
    await inProgress.waitFor({ state: 'visible', timeout: TestTimeouts.BULK_VM_OPERATION });

    const cancelButton = this._migrationModal.locator('button:has-text("Cancel")').first();
    await cancelButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(cancelButton);

    await this._migrationModal.waitFor({ state: 'hidden', timeout: TestTimeouts.DEFAULT });
  }

  async migrateVm(vmName: string): Promise<boolean> {
    try {
      await this.openVmRowActions(vmName);

      const migrationMenuItem = this.locator('button:has-text("Migration")');
      await migrationMenuItem.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const migrateCompute = this.locator('[data-test-id="vm-action-migrate"]');
      await migrateCompute.click();
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

      const migrateButton = this._migrateVirtualMachineBtn;
      await migrateButton.click();

      await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);

      return true;
    } catch {
      return false;
    }
  }

  async migrateVmToSpecificNode(vmName: string, nodeName?: string): Promise<boolean> {
    try {
      await this.openVmRowActions(vmName);

      await this._migrationMenuItem.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this._migrationMenuItem.hover();

      await this._vmActionMigrateCompute.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this._vmActionMigrateCompute.click();

      await this._specificNodeCheckbox.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this._specificNodeCheckbox.click({ force: true });

      await this._nodeSearchInput.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this._nodeSearchInput.fill(nodeName || '');

      const nodeSelectButton = this.locator(`[id="select-${nodeName}"]`);
      await nodeSelectButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await nodeSelectButton.click({ force: true });

      await this._migrateVirtualMachineBtn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this._migrateVirtualMachineBtn.click();

      return true;
    } catch {
      return false;
    }
  }

  async getVisibleMigrationNodeOptions(vmName: string): Promise<string[]> {
    await this.openVmRowActions(vmName);

    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    await this._migrationMenuItem.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._migrationMenuItem.hover();

    await this._vmActionMigrateCompute.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._vmActionMigrateCompute);

    await this._migrationModal.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    await this._specificNodeCheckbox.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._specificNodeCheckbox.click({ force: true });

    await this._nodeSearchInput.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

    const nodeOptionButtons = this.locator('#virtual-machine-migration-modal [id^="select-"]');
    const count = await nodeOptionButtons.count();
    const nodeNames: string[] = [];
    for (let i = 0; i < count; i++) {
      const id = await nodeOptionButtons.nth(i).getAttribute('id');
      if (id?.startsWith('select-')) {
        nodeNames.push(id.replace(/^select-/, ''));
      }
    }

    const closeButton = this.locator('#virtual-machine-migration-modal .pf-v6-c-wizard__close');
    await closeButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(closeButton);

    return nodeNames;
  }

  async getVisibleMigrationNodeOptionsFromOpenModal(): Promise<string[]> {
    await this._specificNodeCheckbox.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._specificNodeCheckbox.click({ force: true });

    const nodeNameCells = this.locator('[aria-label="Nodes table"] [data-test^="node-name-"]');
    await nodeNameCells.first().waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const prefix = 'node-name-';
    const count = await nodeNameCells.count();
    const nodeNames: string[] = [];
    for (let i = 0; i < count; i++) {
      const dataTest = await nodeNameCells.nth(i).getAttribute('data-test');
      if (dataTest?.startsWith(prefix)) {
        nodeNames.push(dataTest.slice(prefix.length));
      }
    }

    return nodeNames;
  }

  async waitForStorageClassMigrationCompletion(): Promise<boolean> {
    try {
      const completed = this._migrationModal.locator('text=Migration completed successfully');
      await completed.waitFor({ state: 'visible', timeout: TestTimeouts.MIGRATION_COMPLETION });

      return true;
    } catch {
      return false;
    }
  }
}

export class VmListTemplateCreateComponent extends BaseComponent {
  private readonly _createButton = this.locator(
    '[data-test-id="details-actions"] [data-test="item-create"]',
  );
  private readonly _templateVmNameInput = this.locator(
    '[data-test-id="template-catalog-vm-name-input"]',
  );
  private readonly _quickCreateVmButton = this.locator('[data-test-id="quick-create-vm-btn"]');
  private readonly _startAfterCreateCheckbox = this.locator('#start-after-create-checkbox');
  private readonly _roleMenuitem = this.locator('[role="menuitem"]');

  constructor(page: Page) {
    super(page);
  }

  async clickVmListCreateSplitOption(
    option: 'From InstanceType' | 'From template' | 'With YAML',
  ): Promise<void> {
    switch (option) {
      case 'With YAML': {
        await this.robustClick(this._createButton);
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        await this.robustClick(this.locator('button[role="menuitem"]:has-text("With YAML")'));
        break;
      }
      case 'From template': {
        const ns = new URL(this.page.url()).pathname.match(/\/ns\/([^/]+)/)?.[1] || 'default';
        await this.goTo(`/k8s/ns/${ns}/catalog`);
        await this.page.waitForLoadState('domcontentloaded');
        break;
      }
      case 'From InstanceType': {
        const ns = new URL(this.page.url()).pathname.match(/\/ns\/([^/]+)/)?.[1] || 'default';
        await this.goTo(`/k8s/ns/${ns}/catalog/instancetype`);
        await this.page.waitForLoadState('domcontentloaded');
        break;
      }
    }
  }

  async fillTemplateVmName(vmName: string) {
    await this._templateVmNameInput.clear();
    await this._templateVmNameInput.fill(vmName);
  }

  async getTemplateVmName(): Promise<string> {
    return await this._templateVmNameInput.inputValue();
  }

  async isTemplateVmNameInputVisible(): Promise<boolean> {
    return await this._templateVmNameInput.isVisible();
  }

  async clickQuickCreateVmButton() {
    await this.robustClick(this._quickCreateVmButton);
  }

  async isQuickCreateVmButtonVisible(): Promise<boolean> {
    return await this._quickCreateVmButton.isVisible();
  }

  async isQuickCreateVmButtonEnabled(): Promise<boolean> {
    return await this._quickCreateVmButton.isEnabled();
  }

  override async clickTemplateByTestId(templateTestId: string) {
    await super.clickTemplateByTestId(templateTestId);
  }

  override async waitForTemplateForm() {
    await super.waitForTemplateForm();
  }

  async clickStartAfterCreateCheckbox() {
    await this._startAfterCreateCheckbox.click();
  }

  async isStartAfterCreateCheckboxVisible(): Promise<boolean> {
    return await this._startAfterCreateCheckbox.isVisible();
  }

  async isStartAfterCreateCheckboxChecked(): Promise<boolean> {
    return await this._startAfterCreateCheckbox.isChecked();
  }

  async getCreateSplitButtonDropdownOptions(): Promise<string[]> {
    try {
      const toggle = this.locator('[data-test-id="details-actions"] [data-test="item-create"]');
      await this.robustClick(toggle);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const items = this._roleMenuitem;
      const texts = await items.allTextContents();
      await this.page.keyboard.press('Escape');
      return texts.map((t) => t.trim()).filter(Boolean);
    } catch {
      return [];
    }
  }
}
