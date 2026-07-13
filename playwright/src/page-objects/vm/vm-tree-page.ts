import PageCommons from '@/page-objects/page-commons';
import { TreeContextMenuMixin } from '@/page-objects/vm/tree-context-menu-mixin';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class VmTreePage extends TreeContextMenuMixin(PageCommons) {
  private readonly _idVmsTreeViewSearchInput = this.locator('[id="vms-tree-view-search-input"]');
  private readonly _overviewTab = this.locator('button[role="tab"]', { hasText: /^Overview$/ });
  private readonly _projectName = this.locator('#project-name');
  private readonly _treeNode = this.locator('.pf-v6-c-tree-view__node');
  private readonly _treeView = this.locator('.pf-v6-c-tree-view');
  private readonly _vmListTab = this.locator('button[role="tab"]', {
    hasText: /^Virtual machines$/,
  });
  private readonly _vmsTreeview = this.locator('[data-test="vms-treeview"]');

  constructor(page: Page) {
    super(page);
  }

  async captureAcmSearchRequestsForCluster(clusterName: string): Promise<{
    totalSearchRequests: number;
    clusterFilteredRequests: Array<{ kind: string; cluster: string }>;
  }> {
    const searchRequests: Array<{ body: string }> = [];

    const handler = (request: {
      method: () => string;
      url: () => string;
      postData: () => string | null;
    }) => {
      if (request.method() === 'POST' && request.url().includes('/proxy/search')) {
        searchRequests.push({ body: request.postData() ?? '' });
      }
    };

    this.page.on('request', handler);

    await this.searchTreeView(clusterName);
    await this.clickClusterNodeInTree(clusterName);
    await this.page.waitForTimeout(5000);

    this.page.removeListener('request', handler);

    const clusterFilteredRequests: Array<{ kind: string; cluster: string }> = [];
    for (const req of searchRequests) {
      try {
        const parsed = JSON.parse(req.body);
        const filters = parsed?.variables?.input?.[0]?.filters ?? [];
        const clusterFilter = filters.find(
          (f: { property: string; values: string[] }) =>
            f.property === 'cluster' && f.values?.includes(clusterName),
        );
        if (clusterFilter) {
          const kindFilter = filters.find((f: { property: string }) => f.property === 'kind');
          clusterFilteredRequests.push({
            kind: kindFilter?.values?.[0] ?? 'unknown',
            cluster: clusterName,
          });
        }
      } catch {}
    }

    return { totalSearchRequests: searchRequests.length, clusterFilteredRequests };
  }

  async clearTreeViewSearch(): Promise<void> {
    const searchInput = this._idVmsTreeViewSearchInput;
    await searchInput.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await searchInput.clear();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async clickClusterNodeInTree(clusterName: string): Promise<void> {
    const clusterNode = this._treeView.locator('button', { hasText: clusterName }).first();
    await clusterNode.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(clusterNode);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async clickFolderNode(folderName: string, namespace: string): Promise<void> {
    const nodeId = `folderSelector/#single-cluster#/${namespace}/${folderName}`;
    const node = this.locator(`[id="${nodeId}"]`);
    await node.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await node.click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async clickFolderSelector(folderName: string, namespace: string): Promise<void> {
    const folderElement = this.locator(
      `[id="folderSelector/#single-cluster#/${namespace}/${folderName}"] button svg`,
    );
    await folderElement.click();
  }

  async clickLocalClusterInTree(): Promise<void> {
    let treeVisible = await this._treeView
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .then(() => true)
      .catch(() => false);

    if (!treeVisible) {
      await this.goTo('/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine');
      await this.page.waitForLoadState('domcontentloaded');
      treeVisible = await this._treeView
        .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
        .then(() => true)
        .catch(() => false);
    }

    const treeItem = this._treeView
      .locator('[role="treeitem"]')
      .filter({
        has: this.page.locator('button', { hasText: 'Local cluster' }),
      })
      .first();
    await treeItem.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    const labelButton = treeItem.locator('button', { hasText: 'Local cluster' }).last();
    await labelButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(labelButton);

    const tabOrError = this.page.locator('[role="tab"], :text("Something wrong happened")').first();
    await tabOrError
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
      .catch(() => undefined);

    await this.recoverFromErrorBoundaryIfNeeded();
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

  async clickVmListTab(): Promise<void> {
    await this._vmListTab.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(this._vmListTab);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
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

    const createButton = this.locator('[data-test="save-button"]');
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

  async isFolderSelectorVisible(folderName: string, namespace: string): Promise<boolean> {
    const folderElement = this.locator(
      `[id="folderSelector/#single-cluster#/${namespace}/${folderName}"]`,
    );
    return await folderElement.isVisible();
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

  async navigateToAllNamespacesVirtualMachines() {
    await this.goTo('/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine');
  }

  async navigateToAllProjects(): Promise<void> {
    const allProjectsNode = this.page.getByRole('treeitem', { name: /All projects/ });
    await allProjectsNode.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(allProjectsNode);
  }

  async navigateToFleetVirtualizationVmsForClusterNamespace(
    clusterName: string,
    namespace: string,
  ): Promise<void> {
    await this.goTo(
      `/fleet-virtualization/kubevirt.io~v1~VirtualMachine/cluster/${clusterName}/ns/${namespace}`,
    );
  }

  async navigateToFolderScopedVirtualMachines(
    namespace: string,
    folderName: string,
  ): Promise<void> {
    const label = encodeURIComponent(`vm.openshift.io/folder=${folderName}`);
    await this.goTo(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine?labels=${label}`);
  }

  async navigateToNamespaceVirtualMachines(namespace: string) {
    await this.goTo(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine`);
  }

  async navigateToNamespaceVirtualMachinesViaUI(namespace: string): Promise<void> {
    try {
      await this.clickNavVirtualMachines();
      await this.page.waitForLoadState('domcontentloaded');
      const currentUrl = this.page.url();
      if (!currentUrl.includes(`/ns/${namespace}/`)) {
        await this.navigateToNamespaceVirtualMachines(namespace);
      }
    } catch {
      await this.navigateToNamespaceVirtualMachines(namespace);
    }
  }

  async navigateToNamespaceVmListAndWait(namespace: string): Promise<void> {
    await this.goTo(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine`);

    const vmListTab = this._vmListTab.or(this.page.getByRole('tab', { name: 'Virtual machines' }));
    try {
      await vmListTab.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(vmListTab.first());
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    } catch {}
  }

  async navigateToProjectViaTreeView(namespace: string): Promise<void> {
    await this.navigateToAllNamespacesVirtualMachines();
    await this.tryCloseWelcomeModal();
    await this.toggleEmptyProjectsDisplay(true);
    await this.searchTreeView(namespace);
    await this.clickProjectNode(namespace);
  }

  async navigateToProjectVirtualMachines(projectName: string) {
    await this.goTo(`/k8s/ns/${projectName}/kubevirt.io~v1~VirtualMachine`);
  }

  async navigateToVirtualMachinesViaUI(): Promise<void> {
    try {
      await this.clickNavVirtualMachines();
    } catch {
      await this.navigateToAllNamespacesVirtualMachines();
    }
  }

  async navigateToVmViaTreeView(namespace: string, vmName: string): Promise<void> {
    await this.navigateToAllNamespacesVirtualMachines();
    await this.tryCloseWelcomeModal();
    await this.toggleEmptyProjectsDisplay(true);
    await this.searchTreeView(namespace);
    await this.clickTreeNodeAndEnsureExpanded(namespace, vmName, namespace);
    await this.clickVmInTreeView(vmName, namespace);
  }

  async recoverFromErrorBoundaryIfNeeded(timeout = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    const errorIndicator = this.page.locator('text=Something wrong happened');
    const hasError = await errorIndicator
      .waitFor({ state: 'visible', timeout: 3000 })
      .then(() => true)
      .catch(() => false);

    if (!hasError) return false;

    const currentUrl = new URL(this.page.url());
    const tabParam = currentUrl.searchParams.get('tab');
    const vmUrl = new URL('/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine', currentUrl.origin);
    if (tabParam) vmUrl.searchParams.set('tab', tabParam);

    await this.page.goto(vmUrl.toString(), {
      waitUntil: 'domcontentloaded',
      timeout,
    });
    await this.page.waitForSelector('[role="tab"]', {
      state: 'visible',
      timeout,
    });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    return true;
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
