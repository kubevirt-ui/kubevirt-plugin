import NavigationComponent from '@/components/shared/navigation-component';
import BasePage from '@/page-objects/base-page';
import { VmListPage } from '@/page-objects/vm-list-page';
import { ConsoleRoutes } from '@/utils/console-routes';
import { dismissConsoleObstructions } from '@/utils/console-modals';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

/**
 * VM list / tree navigation for vm-wizard specs (subset of main VirtualMachinesPage).
 */
export default class WizardVmNavigationPage extends BasePage {
  private readonly nav = new NavigationComponent(this.page);
  private readonly vmList = new VmListPage(this.page);

  constructor(page: Page) {
    super(page);
  }

  async switchToVirtualizationPerspective(): Promise<void> {
    await this.nav.switchToVirtualizationPerspective();
  }

  async clickVmListTab(): Promise<void> {
    const tab = this.page.locator('button[role="tab"]', { hasText: /^Virtual machines$/ });
    await tab.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(tab);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async navigateToAllNamespacesVirtualMachines(): Promise<void> {
    await this.goTo(ConsoleRoutes.virtualMachines());
  }

  async navigateToNamespaceVirtualMachines(namespace: string): Promise<void> {
    await this.goTo(ConsoleRoutes.virtualMachinesInNamespace(namespace));
  }

  async navigateToProjectVirtualMachines(namespace: string): Promise<void> {
    await this.navigateToNamespaceVirtualMachines(namespace);
  }

  async navigateToProjectVmListViaUI(namespace: string): Promise<void> {
    await this.switchToVirtualizationPerspective();
    await this.vmList.goToNamespaceList(namespace);
    await this.clickVmListTab();
  }

  async navigateToVirtualMachinesViaUI(): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await this.switchToVirtualizationPerspective();
    await this.nav.clickNavVirtualMachines().catch(async () => {
      await this.navigateToAllNamespacesVirtualMachines();
    });
  }

  /**
   * Open `/vm-wizard` with plugin priming + tree Create fallback (see {@link VmListPage.openVmCreationWizard}).
   */
  async openVmCreationWizard(namespace: string): Promise<void> {
    await this.vmList.openVmCreationWizard(namespace);
  }
}
