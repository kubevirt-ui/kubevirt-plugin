/**
 * VM list — Empty state, tree view, and migration wizard components.
 */

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/** VM list empty state, onboarding / guided-tour mocks, and user-settings route interception. */
export class VmListEmptyStateComponent extends BaseComponent {
  private static readonly _USER_SETTINGS_URL =
    '**/api/kubernetes/api/v1/namespaces/openshift-cnv/configmaps/kubevirt-user-settings';

  private static readonly _VM_LIST_PATH = '/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine';

  private readonly _vmListTab = this.locator('button[role="tab"]', {
    hasText: /^Virtual machines$/,
  });

  constructor(page: Page) {
    super(page);
  }

  async clearEmptyStateMocks(): Promise<void> {
    await this.page.unrouteAll();
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

  async getOnboardingPopoverHeaderText(): Promise<string> {
    try {
      const header = this.page.locator('.pf-v6-c-popover__title-text');
      await header.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      return (await header.textContent())?.trim() ?? '';
    } catch {
      return '';
    }
  }

  async isEmptyStateCreateButtonVisible(): Promise<boolean> {
    try {
      const btn = this.locator('.pf-v6-c-empty-state').locator('[data-test="item-create"]');
      await btn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      return true;
    } catch {
      return false;
    }
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

  async isNoVMsMessageNotVisible(): Promise<boolean> {
    const noVMsMessage = this.locator('text=No VirtualMachines found');
    return !(await noVMsMessage.isVisible().catch(() => false));
  }

  async isNoVMsMessageVisible(): Promise<boolean> {
    try {
      const noVMsMessage = this.locator(
        '.pf-v6-c-empty-state__title, .pf-v6-c-empty-state h1, .pf-v6-c-empty-state h3, .pf-v6-c-empty-state h4',
      ).filter({ hasText: /no virtual ?machines|don.*t have any virtual ?machines/i });
      await noVMsMessage.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async isOnboardingPopoverVisible(
    timeout: number = TestTimeouts.UI_VISIBILITY_QUICK,
  ): Promise<boolean> {
    try {
      const popover = this.page.getByTestId('onboarding-popover');
      await popover.waitFor({ state: 'visible', timeout });
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

  async mockProjectCreatePermission(allowed: boolean): Promise<void> {
    await this.page.route(
      '**/apis/authorization.k8s.io/v1/selfsubjectaccessreviews',
      async (route) => {
        const request = route.request();
        if (request.method() !== 'POST') {
          await route.fallback();
          return;
        }

        let body: Record<string, unknown> | null = null;
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

  async navigateToNamespaceVmListAndWait(namespace: string): Promise<void> {
    await this.goTo(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine`);

    const vmListTab = this._vmListTab.or(this.page.getByRole('tab', { name: 'Virtual machines' }));
    try {
      await vmListTab.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(vmListTab.first());
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    } catch {
      // No tab means Virtualization perspective renders the VM list directly
    }
  }
}

/** VM list tree view: drawer, search, namespace/project nodes, and folder rows. */
export class VmListTreeComponent extends BaseComponent {
  private readonly _idVmsTreeViewSearchInput = this.locator('[id="vms-tree-view-search-input"]');
  private readonly _projectName = this.locator('#project-name');
  private readonly _treeNode = this.locator('.pf-v6-c-tree-view__node');
  private readonly _treeView = this.locator('.pf-v6-c-tree-view');
  private readonly _vmsTreeview = this.testId('vms-treeview');

  constructor(page: Page) {
    super(page);
  }

  async clearTreeViewSearch(): Promise<void> {
    const searchInput = this._idVmsTreeViewSearchInput;
    await searchInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await searchInput.clear();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async clickFolderNode(folderName: string, namespace: string): Promise<void> {
    const nodeId = `folderSelector/#single-cluster#/${namespace}/${folderName}`;
    const node = this.locator(`[id="${nodeId}"]`);
    await node.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await node.click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async clickProjectNode(namespace: string): Promise<void> {
    const nodeId = `projectSelector/#single-cluster#/${namespace}`;
    const containerNode = this.locator(`[id="${nodeId}"]`);

    const waitForNode = async (): Promise<void> => {
      await containerNode.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    };

    try {
      await waitForNode();
    } catch {
      await this.searchTreeView(namespace);
      await waitForNode();
    }

    const buttonChild = containerNode.locator('button', { hasText: namespace });
    const hasButton = await buttonChild.isVisible().catch(() => false);
    const target = hasButton ? buttonChild : containerNode;

    try {
      await target.click({ timeout: TestTimeouts.UI_DELAY_MEDIUM });
    } catch {
      await target.dispatchEvent('click');
    }
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async clickTreeNode(nodeName: string): Promise<void> {
    const nodeId = `projectSelector/#single-cluster#/${nodeName}`;
    const node = this.locator(`[id="${nodeId}"]`);
    try {
      await node.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    } catch {
      await this.searchTreeView(nodeName);
      await node.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    }
    await node.click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async clickTreeNodeAndEnsureExpanded(
    nodeName: string,
    vmName?: string,
    namespace?: string,
  ): Promise<void> {
    await this.clickTreeNode(nodeName);

    let needsExpansion = false;

    if (vmName && namespace) {
      const vmId = this.locator(`[id="#single-cluster#/${namespace}/${vmName}"]`);
      const isVmVisible = await vmId
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);
      needsExpansion = !isVmVisible;
    } else {
      const nodeId = `projectSelector/#single-cluster#/${nodeName}`;
      const expandButton = this.locator(`[id="${nodeId}"] button svg`);
      const expandButtonExists = await expandButton
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);

      if (expandButtonExists) {
        const node = this.locator(`[id="${nodeId}"]`);
        const ariaExpanded = await node.getAttribute('aria-expanded').catch(() => null);
        needsExpansion = ariaExpanded === 'false';
      }
    }

    if (needsExpansion) {
      await this.expandTreeNode(nodeName);
    }
  }

  async clickVmInFolderInTreeView(vmName: string, namespace: string): Promise<void> {
    const treeRowId = `#single-cluster#/${namespace}/${vmName}`;
    const locator = this.locator(`[id="${treeRowId}"]`);
    try {
      await locator.waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    } catch {
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
      const nsNode = this.locator(`[id="projectSelector/#single-cluster#/${namespace}"]`);
      if (await nsNode.isVisible()) {
        await nsNode.click();
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }
      await locator.waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    }
    await this.robustClick(locator);
  }

  async clickVmInTreeView(vmName: string, namespace: string): Promise<void> {
    await this.clickTreeNodeAndEnsureExpanded(namespace, vmName, namespace);
    const vmId = this.locator(`[id="#single-cluster#/${namespace}/${vmName}"]`);
    await vmId.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(vmId);
  }

  async createProject(projectName: string): Promise<void> {
    const allProjectsNode = this._treeNode.filter({ hasText: 'All projects' }).first();
    await allProjectsNode.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await allProjectsNode.click({ button: 'right' });
    await this.page.waitForTimeout(TestTimeouts.UI_ANIMATION_DELAY);

    const createProjectOption = this.locator('button:has-text("Create project")');
    await createProjectOption.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await createProjectOption.click();

    const modal = this.locator('#tab-modal');
    await modal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    await this._projectName.clear();
    await this._projectName.fill(projectName);

    const createButton = this.testId('save-button');
    await createButton.click();

    await modal.waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async doTreeViewNodesHaveDistinguishableIcons(
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<boolean> {
    const viewBoxes = await this.getTreeViewNodeIconViewBoxes(timeout);
    return viewBoxes.length >= 2;
  }

  async expandTreeNode(nodeName: string): Promise<void> {
    const nodeId = `projectSelector/#single-cluster#/${nodeName}`;
    const expandButton = this.locator(`[id="${nodeId}"] button svg`);
    await expandButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await expandButton.click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async getTreeNodeCount(nodeName: string): Promise<string | null> {
    try {
      const node = this._treeNode.filter({ hasText: nodeName });
      await node.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      const countElement = node.locator('.pf-v6-c-tree-view__node-count');
      const countText = await countElement.textContent();
      return countText?.trim() || null;
    } catch {
      return null;
    }
  }

  async getTreeViewMatchedCount(): Promise<string | null> {
    try {
      const heading = this.locator('h6:has-text("projects found"), h6:has-text("clusters found")');
      await heading.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return await heading.textContent();
    } catch {
      return null;
    }
  }

  async getTreeViewNodeIconViewBoxes(timeout = TestTimeouts.ELEMENT_WAIT): Promise<string[]> {
    try {
      const nodeIcons = this.locator('.pf-v6-c-tree-view__node-icon svg');
      await nodeIcons.first().waitFor({ state: 'visible', timeout });
      const count = await nodeIcons.count();
      const viewBoxes = new Set<string>();
      for (let i = 0; i < count; i++) {
        const viewBox = await nodeIcons.nth(i).getAttribute('viewBox');
        if (viewBox) viewBoxes.add(viewBox);
      }
      return [...viewBoxes];
    } catch {
      return [];
    }
  }

  async isTreeNodeVisible(nodeName: string): Promise<boolean> {
    try {
      const node = this._treeNode.filter({ hasText: nodeName });
      return await node.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false);
    } catch {
      return false;
    }
  }

  async isTreeviewNotVisible(): Promise<boolean> {
    return !(await this._treeView.isVisible().catch(() => false));
  }

  async isTreeviewVisible(): Promise<boolean> {
    return await this._treeView.isVisible().catch(() => false);
  }

  async navigateToAllNamespacesVirtualMachines(): Promise<void> {
    await this.goTo('/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine');
  }

  async navigateToAllProjects(): Promise<void> {
    const allProjectsNode = this.page.getByRole('treeitem', { name: /All projects/ });
    await allProjectsNode.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(allProjectsNode);
  }

  async searchTreeView(searchText: string): Promise<void> {
    const searchInput = this._idVmsTreeViewSearchInput;
    try {
      await searchInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    } catch {
      await this.navigateToAllNamespacesVirtualMachines();
      await this.page.waitForLoadState('networkidle');
      await searchInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    }
    await searchInput.clear();
    await searchInput.pressSequentially(searchText, { delay: 250 });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
  }

  async toggleEmptyProjectsDisplay(show: boolean): Promise<void> {
    const checkbox = this.locator('.vms-tree-view__toolbar-switch input[type="checkbox"]');

    try {
      await checkbox.waitFor({ state: 'attached', timeout: TestTimeouts.ELEMENT_WAIT });
    } catch {
      return;
    }

    const isChecked = await checkbox.isChecked().catch(() => false);
    const needsToggle = (show && isChecked) || (!show && !isChecked);

    if (needsToggle) {
      await checkbox.click({ force: true });
    }

    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async toggleTreeviewDrawer(): Promise<boolean> {
    await this.locator('#vms-tree-view-panel .vms-tree-view__panel-toggle-button').click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    return await this._treeView.isVisible().catch(() => false);
  }

  async verifyVmsTreeviewExists(): Promise<boolean> {
    try {
      await this._vmsTreeview.waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      return await this._vmsTreeview.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }
}

/** List-page storage and compute migration wizard flows (VirtualMachines list). */
export class VmListMigrationComponent extends BaseComponent {
  private readonly _migrationModal = this.locator('#virtual-machine-migration-modal');
  private readonly _btnSelectStorageClass = this._migrationModal.locator(
    'button.pf-v6-c-menu-toggle.pf-m-full-width',
  );
  private readonly _buttonpfV6CButtonpfMPrimary = this._migrationModal.locator(
    'button.pf-v6-c-button.pf-m-primary',
  );
  private readonly _buttonpfV6CButtonpfMSecondary = this._migrationModal.locator(
    'button.pf-v6-c-button.pf-m-secondary',
  );
  private readonly _inputIdSelectedVolumes = this.locator('input[id="selected-volumes"]');
  private readonly _migrateStorageAction = this.testId('vm-action-migrate-storage');
  private readonly _migrateVirtualMachineBtn = this.locator(
    '#tab-modal button:has-text("Migrate VirtualMachine")',
  );
  private readonly _migrationMenuItem = this.testId('migration-menu');
  private readonly _nodeSearchInput = this.locator('#tab-modal input[placeholder="Search node"]');
  private readonly _selectAllRows = this._migrationModal.locator('[aria-label="Select all rows"]');
  private readonly _specificNodeCheckbox = this.locator(
    '#tab-modal #manual-migration-option-selection',
  );
  private readonly _vmActionMigrateCompute = this.testId('vm-action-migrate-compute');

  constructor(
    page: Page,
    private readonly openVmRowActions: (vmName: string) => Promise<void>,
  ) {
    super(page);
  }

  async clickBulkMigrateStorage(): Promise<void> {
    await this.robustClick(this.testId('vms-bulk-migrate-storage'));
  }

  async clickSelectedVolumesRadio(): Promise<void> {
    const selectedVolumesOption = this._inputIdSelectedVolumes;
    await selectedVolumesOption.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await selectedVolumesOption.click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async closeMigrationModal(): Promise<void> {
    const closeButton = this._migrationModal.locator('.pf-v6-c-wizard__close');
    await closeButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(closeButton);
    await this._migrationModal.waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT });
  }

  async completeMigrationWizardWithStorageClass(
    destinationStorageClass: string,
    migrationCompletionTimeoutMs: number = TestTimeouts.MIGRATION_COMPLETION,
    keepOriginalVolumes = false,
  ): Promise<boolean> {
    try {
      const nextButton = this._buttonpfV6CButtonpfMPrimary;

      await nextButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

      const selectSCButton = this._btnSelectStorageClass;
      await selectSCButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(selectSCButton);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const scOption = this._migrationModal.locator(
        `button#select-inline-filter-${destinationStorageClass}`,
      );
      await scOption.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(scOption);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const keepVolumesCheckbox = this._migrationModal.locator('#keep-original-volumes');
      const isChecked = await keepVolumesCheckbox.isChecked();
      if (keepOriginalVolumes !== isChecked) {
        await keepVolumesCheckbox.click({ force: true });
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }

      await nextButton.click();
      await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);

      await nextButton.click();

      const inProgress = this._migrationModal.locator('text=In progress').first();
      await inProgress.waitFor({ state: 'visible', timeout: TestTimeouts.BULK_VM_OPERATION });

      const completed = this._migrationModal.locator('text=Storage migration completed').first();
      await completed.waitFor({ state: 'visible', timeout: migrationCompletionTimeoutMs });

      const closeButton = this._migrationModal.locator('button', { hasText: 'Close' });
      await closeButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(closeButton);

      return true;
    } catch (error) {
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
      throw new Error(
        `completeMigrationWizardWithStorageClass failed: ${error instanceof Error ? error.message : String(error)}`,
      );
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

    const computeModal = this.locator('#tab-modal');
    await computeModal.waitFor({
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

    const nodeOptionButtons = computeModal.locator('[id^="select-"]');
    const count = await nodeOptionButtons.count();
    const nodeNames: string[] = [];
    for (let i = 0; i < count; i++) {
      const id = await nodeOptionButtons.nth(i).getAttribute('id');
      if (id?.startsWith('select-')) {
        nodeNames.push(id.replace(/^select-/, ''));
      }
    }

    const closeButton = computeModal.locator('button[aria-label="Close"]');
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

  async isNextButtonDisabled(): Promise<boolean> {
    const nextButton = this._migrationModal.locator('button.pf-v6-c-button.pf-m-primary');
    await nextButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    return await nextButton.isDisabled();
  }

  async isWizardNavStepDisabled(stepName: string): Promise<boolean> {
    const navLink = this._migrationModal
      .locator('.pf-v6-c-wizard__nav-link')
      .filter({ hasText: stepName });
    await navLink.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    return await navLink.isDisabled();
  }

  async migrateVm(vmName: string): Promise<boolean> {
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

      if (nodeName) {
        await this._nodeSearchInput.fill(nodeName);
      }

      const nodeSelector = nodeName
        ? `#tab-modal [id="select-${nodeName}"]`
        : '#tab-modal [id^="select-"]';
      const nodeSelectButton = this.locator(nodeSelector).first();
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

  async openStorageMigrationModal(vmName: string, assertNextEnabled = true): Promise<void> {
    await this.openVmRowActions(vmName);
    const migrationMenu = this.testId('migration-menu');
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

      const selectSCButton = this._btnSelectStorageClass;
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

  async performStorageClassMigration(
    vmName: string,
    destinationStorageClass: string,
    selectedVolumes = false,
    migrationCompletionTimeoutMs: number = TestTimeouts.MIGRATION_COMPLETION,
    keepOriginalVolumes = false,
  ): Promise<boolean> {
    try {
      await this.openVmRowActions(vmName);

      const migrationMenu = this.testId('migration-menu');
      await migrationMenu.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(migrationMenu);

      const migrateStorage = this._migrateStorageAction;
      await migrateStorage.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(migrateStorage);

      await this._migrationModal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

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

      return await this.completeMigrationWizardWithStorageClass(
        destinationStorageClass,
        migrationCompletionTimeoutMs,
        keepOriginalVolumes,
      );
    } catch (error) {
      throw new Error(
        `performStorageClassMigration failed for VM "${vmName}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async selectAllVolumesInMigrationModal(): Promise<void> {
    const selectAllRows = this._selectAllRows;
    await selectAllRows.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await selectAllRows.click({ force: true });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async startStorageMigrationAndCancelWhileInProgress(vmName: string): Promise<void> {
    await this.openVmRowActions(vmName);

    const migrationMenu = this.testId('migration-menu');
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

  async triggerStorageMigration(
    vmName: string,
    destinationStorageClass: string,
    selectedVolumes = false,
    keepOriginalVolumes = false,
  ): Promise<void> {
    await this.openVmRowActions(vmName);

    const migrationMenu = this.testId('migration-menu');
    await migrationMenu.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(migrationMenu);

    const migrateStorage = this._migrateStorageAction;
    await migrateStorage.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(migrateStorage);

    const migrationModal = this.locator('#virtual-machine-migration-modal');
    await migrationModal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    if (selectedVolumes) {
      const selectedVolumesOption = this._inputIdSelectedVolumes;
      await selectedVolumesOption.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
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

    const selectSCButton = migrationModal.locator('button.pf-v6-c-menu-toggle.pf-m-full-width');
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

    const closeButton = this.locator('.pf-v6-c-wizard__close');
    await closeButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(closeButton);
    await migrationModal.waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT });
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
