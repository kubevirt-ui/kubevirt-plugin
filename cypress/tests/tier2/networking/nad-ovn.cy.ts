import { NIC, VirtualMachineData } from '../../../types/vm';
import { adminOnlyDescribe, nnsIT, TEST_NS, VM_STATUS } from '../../../utils/const/index';
import { NAD_BRIDGE, NAD_OVN } from '../../../utils/const/nad';
import { TEMPLATE } from '../../../utils/const/template';
import * as vma from '../../../views/actions';
import { createNAD } from '../../../views/nad';
import { restartIcon } from '../../../views/selector-common';
import { tab } from '../../../views/tab';
import { getRow, vm, waitForStatus } from '../../../views/vm-flow';

export const nic: NIC = {
  model: 'virtio',
  name: 'nic-ovn-virtio',
  network: NAD_OVN.name,
};

const testVM: VirtualMachineData = {
  ethName: 'eth1',
  gateway: '192.168.1.255',
  ipAddr: '192.168.1.15',
  name: 'vm-with-nic-ovn',
  namespace: TEST_NS,
  nics: [nic],
  template: TEMPLATE.FEDORA,
};

adminOnlyDescribe('Test L2 overlay NAD', () => {
  before(() => {
    cy.deleteVMs([testVM]);
    cy.beforeSpec();
    cy.visitNAD();
    cy.switchProject(TEST_NS);
  });

  after(() => {
    cy.deleteVMs([testVM]);
  });

  it('ID(CNV-3256) create NAD with L2 overlay network', () => {
    createNAD(NAD_OVN);
  });

  nnsIT('ID(CNV-) create VM with L2 overlay NAD', () => {
    vm.customizeCreate(testVM);
  });

  // flaky
  // nnsIT('verify NAD is properly labeled', () => {
  xit('verify NAD is properly labeled', () => {
    tab.navigateToConfigurationNetwork();
    getRow(testVM.nics[0].name, () => cy.get(vma.vmActions).find('button').click());
    cy.byButtonText('Edit').click();
    cy.checkTitle('Edit network interface');
    cy.byLegacyTestID('network-attachment-definition-select')
      .find('button[aria-label="Menu toggle"]')
      .click();
    cy.byButtonText(`${testVM.namespace}/${NAD_BRIDGE.name}`).click();
    cy.clickSaveBtn();
    cy.get(restartIcon).click();
    waitForStatus(testVM.name, VM_STATUS.Running, false);
    getRow(testVM.nics[0].name, () =>
      cy.contains('[data-label="network"]', NAD_BRIDGE.name).should('exist'),
    );
    tab.navigateToOverview();
  });
});
