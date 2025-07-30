import { VirtualMachineData } from '../../../types/vm';
import { vmDisks } from '../../../utils/const/diskSource';
import { adminOnlyDescribe, TEST_NS } from '../../../utils/const/index';
import { navigateToConfigurationSubTab, subTabName, tab } from '../../../views/tab';
import { vm } from '../../../views/vm-flow';

const TEST_VM: VirtualMachineData = {
  disks: vmDisks,
  name: 'vm-customized-it',
  namespace: TEST_NS,
  startOnCreation: false,
  volume: 'fedora',
};

adminOnlyDescribe('Test customize InstanceType VM', () => {
  before(() => {
    cy.deleteVMs([TEST_VM]);
    cy.beforeSpec();
  });

  after(() => {
    cy.deleteVMs([TEST_VM]);
  });

  it('ID(CNV-11274) create InstanceType vm with customizations', () => {
    vm.customizeIT(TEST_VM, false);
    tab.navigateToConfiguration();
    navigateToConfigurationSubTab(subTabName.Storage);
    TEST_VM.disks.forEach((disk) => {
      cy.contains(disk.name).should('exist');
    });
  });
});
