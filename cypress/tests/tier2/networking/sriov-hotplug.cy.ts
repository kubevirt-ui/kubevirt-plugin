import { NIC, VirtualMachineData } from '../../../types/vm';
import { SECOND, sriovDescribe, TEST_NS } from '../../../utils/const/index';
import { addNic } from '../../../views/modals';
import { tab } from '../../../views/tab';
import { vm } from '../../../views/vm-flow';

export const SRIOV_NIC: NIC = {
  name: 'srivo-nic',
  network: 'sriov-network',
};

const testVM: VirtualMachineData = {
  name: 'vm-sriov-nic-hotplug',
  namespace: TEST_NS,
  volume: 'rhel9',
};

sriovDescribe('Test sriov network hotplug', () => {
  before(() => {
    cy.deleteVMs([testVM]);
    cy.beforeSpec();
  });

  after(() => {
    cy.deleteVMs([testVM]);
  });

  it('ID(CNV-10790) verify network interface is presenting in VMI after migration', () => {
    vm.instanceCreate(testVM);
    tab.navigateToConfigurationNetwork();
    cy.wait(5 * SECOND);
    addNic(SRIOV_NIC);
    vm.migrate(testVM.name);
    cy.byLegacyTestID(testVM.name).click();
    tab.navigateToOverview();
    cy.byLegacyTestID(testVM.name).click();
    cy.wait(10 * SECOND);
    tab.navigateToTNetworks();
    cy.contains(SRIOV_NIC.name).should('exist');
  });
});
