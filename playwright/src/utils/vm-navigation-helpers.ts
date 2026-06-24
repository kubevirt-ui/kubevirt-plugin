import type VirtualMachineDetailPage from '@/page-objects/vm/virtual-machine-detail-page';
import type VmTreePage from '@/page-objects/vm/vm-tree-page';

const VM_CONFIG_NAV_MAX_ATTEMPTS = 3;
const CLOUD_INIT_VERIFY_ATTEMPTS = 5;
const TREE_VIEW_VISIBILITY_RETRIES = 3;

/**
 * Navigate to a project's VM list through the tree view.
 */
export async function navigateToProjectVmList(
  vmTreePage: VmTreePage,
  namespace: string,
): Promise<void> {
  await vmTreePage.navigateToNamespaceVirtualMachinesViaUI(namespace);
  await vmTreePage.toggleEmptyProjectsDisplay(true);
  await vmTreePage.searchTreeView(namespace);
  await vmTreePage.clickProjectNode(namespace);
  await vmTreePage.clickVmListTab();
}

/**
 * Like {@link navigateToProjectVmList} but retries until the tree view is
 * visible before interacting — useful when concurrent tests leave the UI in
 * mid-navigation state.
 */
export async function navigateToProjectVmListWithRetry(
  vmTreePage: VmTreePage,
  namespace: string,
): Promise<void> {
  await vmTreePage.navigateToNamespaceVirtualMachinesViaUI(namespace);
  for (let attempt = 0; attempt < TREE_VIEW_VISIBILITY_RETRIES; attempt++) {
    const visible = await vmTreePage.isTreeviewVisible();
    if (visible) break;
    await vmTreePage.navigateToNamespaceVirtualMachinesViaUI(namespace);
  }
  await vmTreePage.toggleEmptyProjectsDisplay(true);
  await vmTreePage.searchTreeView(namespace);
  await vmTreePage.clickProjectNode(namespace);
  await vmTreePage.clickVmListTab();
}

/**
 * Open the VM tree with "Show empty projects" enabled, without drilling into a
 * specific project's VM list.
 */
export async function navigateToVmTreeWithEmptyProjects(
  vmTreePage: VmTreePage,
  namespace: string,
): Promise<void> {
  await vmTreePage.navigateToNamespaceVirtualMachinesViaUI(namespace);
  await vmTreePage.toggleEmptyProjectsDisplay(true);
}

export interface VmNavPages {
  vmTreePage: VmTreePage;
  vmDetailPage: VirtualMachineDetailPage;
}

/**
 * @param namespace - Project/namespace containing the VM (tree search and navigation).
 * @param vmName - Target VirtualMachine name.
 */
export async function navigateToVmDetailAndConfigurationSubTab(
  { vmTreePage }: VmNavPages,
  namespace: string,
  vmName: string,
  openConfigurationSubTab: () => Promise<void>,
): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt < VM_CONFIG_NAV_MAX_ATTEMPTS; attempt++) {
    try {
      await vmTreePage.navigateToVirtualMachinesViaUI();
      await vmTreePage.toggleEmptyProjectsDisplay(true);
      await vmTreePage.searchTreeView(namespace);
      await vmTreePage.clickTreeNodeAndEnsureExpanded(namespace, vmName, namespace);
      await vmTreePage.clickVmInTreeView(vmName, namespace);
      await openConfigurationSubTab();
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export async function verifyCloudInitWithRetries({ vmDetailPage }: VmNavPages): Promise<boolean> {
  for (let i = 0; i < CLOUD_INIT_VERIFY_ATTEMPTS; i++) {
    const ok = await vmDetailPage.verifyCloudInit();
    if (ok) {
      return true;
    }
    if (i < CLOUD_INIT_VERIFY_ATTEMPTS - 1) {
      await vmDetailPage.detailNav.navigateToConfigurationInitialRun().catch(() => undefined);
    }
  }
  return false;
}
