import type VirtualMachineDetailPage from '@/page-objects/vm/virtual-machine-detail-page';
import type VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';

const VM_CONFIG_NAV_MAX_ATTEMPTS = 3;
const CLOUD_INIT_VERIFY_ATTEMPTS = 5;

export interface VmNavPages {
  vmListPage: VirtualMachinesPage;
  vmDetailPage: VirtualMachineDetailPage;
}

/**
 * @param namespace - Project/namespace containing the VM (tree search and navigation).
 * @param vmName - Target VirtualMachine name.
 */
export async function navigateToVmDetailAndConfigurationSubTab(
  { vmListPage, vmDetailPage }: VmNavPages,
  namespace: string,
  vmName: string,
  openConfigurationSubTab: () => Promise<void>,
): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt < VM_CONFIG_NAV_MAX_ATTEMPTS; attempt++) {
    try {
      await vmListPage.navigateToVirtualMachinesViaUI();
      await vmListPage.toggleEmptyProjectsDisplay(true);
      await vmListPage.searchTreeView(namespace);
      await vmListPage.clickTreeNodeAndEnsureExpanded(namespace, vmName, namespace);
      await vmListPage.clickVmInTreeView(vmName, namespace);
      await openConfigurationSubTab();
      return;
    } catch (error) {
      lastError = error;
    }
  }
  try {
    await vmDetailPage.navigateToVirtualMachineDetail(vmName, namespace);
    await openConfigurationSubTab();
  } catch (fallbackError) {
    throw lastError instanceof Error ? lastError : fallbackError;
  }
}

export async function verifyCloudInitWithRetries({ vmDetailPage }: VmNavPages): Promise<boolean> {
  for (let i = 0; i < CLOUD_INIT_VERIFY_ATTEMPTS; i++) {
    const ok = await vmDetailPage.verifyCloudInit();
    if (ok) {
      return true;
    }
    if (i < CLOUD_INIT_VERIFY_ATTEMPTS - 1) {
      await vmDetailPage.navigateToConfigurationInitialRun().catch(() => undefined);
    }
  }
  return false;
}
