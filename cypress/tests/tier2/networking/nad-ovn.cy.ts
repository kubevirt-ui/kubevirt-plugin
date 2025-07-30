import { NIC, VirtualMachineData } from '../../../types/vm';
import {
  adminOnlyDescribe,
  MINUTE,
  nnsDescribe,
  nnsIT,
  SECOND,
  TEST_NS,
  VM_STATUS,
} from '../../../utils/const/index';
import { NAD_BRIDGE, NAD_OVN } from '../../../utils/const/nad';
import { pending } from '../../../utils/const/string';
import { TEMPLATE } from '../../../utils/const/template';
import { VM_EXAMPLE } from '../../../utils/const/testVM';
import { MIGRATE_COMPUTE } from '../../../views/actions';
import * as vma from '../../../views/actions';
import { addNic } from '../../../views/modals';
import { createNAD } from '../../../views/nad';
import { restartIcon } from '../../../views/selector-common';
import { tab } from '../../../views/tab';
import { getRow, vm, waitForStatus } from '../../../views/vm-flow';

export const nic: NIC = {
  model: 'virtio',
  name: 'nic-ovn-virtio',
  network: NAD_OVN.name,
};

export const nic1: NIC = {
  model: 'e1000e',
  name: 'nic-ovn-e1000e',
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
    cy.visitNAD();
    cy.deleteVMs([testVM]);
  });

  after(() => {
    cy.deleteVMs([testVM]);
  });

  it('ID(CNV-3256) create NAD with L2 overlay network', () => {
    cy.switchProject(TEST_NS);
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

nnsDescribe('Test network hotplug', () => {
  before(() => {
    cy.patchVM(VM_EXAMPLE.name, 'Always');
    cy.beforeSpec();
  });

  after(() => {
    cy.patchVM(VM_EXAMPLE.name, 'Halted');
  });

  it(
    'visit vm list page',
    {
      retries: {
        openMode: 0,
        runMode: 8,
      },
    },
    () => {
      cy.visitVMs();
    },
  );

  it('migrate VM with hot-plug nic', () => {
    cy.byLegacyTestID(VM_EXAMPLE.name).click();
    tab.navigateToConfigurationNetwork();
    cy.wait(MINUTE);
    waitForStatus(VM_EXAMPLE.name, VM_STATUS.Running, false);
    cy.wait(5 * SECOND);
    addNic(nic1);
    cy.wait(3 * SECOND);
    cy.byButtonText('Actions').click();
    cy.wait(2 * SECOND);
    cy.get('[data-test-id="migration-menu"]').trigger('mouseover');
    cy.wait(2 * SECOND);
    cy.byLegacyTestID(MIGRATE_COMPUTE).click();
    cy.wait(MINUTE);
  });

  it(
    'wait for VMI migration complete',
    {
      retries: {
        runMode: 10,
      },
    },
    () => {
      cy.contains('.pf-v6-c-alert__title', pending).should('not.exist');
    },
  );

  it('ID(CNV-10789) verify network interface is presenting in VMI after migration', () => {
    cy.contains(nic1.name).should('exist');
  });
});
