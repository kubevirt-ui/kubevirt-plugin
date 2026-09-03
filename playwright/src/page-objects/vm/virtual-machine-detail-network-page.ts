import VmConfigurationNetworkComponent from '@/components/vm/vm-configuration-network-component';
import { VirtualMachineDetailNetworkComponent } from '@/components/vm/vm-detail-overview-scheduling-components';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class VirtualMachineDetailNetworkPage extends VirtualMachineDetailNetworkComponent {
  private readonly configNetwork: VmConfigurationNetworkComponent;

  constructor(page: Page) {
    super(page);
    this.configNetwork = new VmConfigurationNetworkComponent(page);
  }

  async changeNicNetworkAttachment(nicName: string, nadName: string): Promise<void> {
    return this.configNetwork.changeNicNetworkAttachment(nicName, nadName);
  }

  async getNicNetworkName(nicName: string): Promise<string> {
    return this.configNetwork.getNicNetworkName(nicName);
  }

  async verifyNicDisplaysNad(nicName: string, expectedNadName: string): Promise<boolean> {
    return this.configNetwork.verifyNicDisplaysNad(nicName, expectedNadName);
  }

  async waitForPendingChangesAlert(
    timeout: number = TestTimeouts.PENDING_CHANGES,
  ): Promise<boolean> {
    return this.configNetwork.waitForPendingChangesAlert(timeout);
  }
}
