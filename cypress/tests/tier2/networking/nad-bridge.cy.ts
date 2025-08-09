import { NIC, VirtualMachineData } from '../../../types/vm';
import { adminOnlyDescribe, MINUTE, nnsIT, TEST_NS } from '../../../utils/const/index';
import { NAD_BRIDGE } from '../../../utils/const/nad';
import { TEMPLATE } from '../../../utils/const/template';
import { createNAD } from '../../../views/nad';
import { vm } from '../../../views/vm-flow';

export const nic1: NIC = {
  model: 'virtio',
  name: 'nic-bridge-virtio',
  network: NAD_BRIDGE.name,
};

export const nic2: NIC = {
  model: 'e1000e',
  name: 'nic-bridge-e1000e',
  network: NAD_BRIDGE.name,
};

const testVM1: VirtualMachineData = {
  ethName: 'eth1',
  gateway: '192.168.1.255',
  ipAddr: '192.168.1.15',
  name: `vm-with-nic-${nic1.model}`,
  namespace: TEST_NS,
  nics: [nic1],
  template: TEMPLATE.RHEL9,
};

const testVM2: VirtualMachineData = {
  ethName: 'eth1',
  gateway: '192.168.1.255',
  ipAddr: '192.168.1.15',
  name: `vm-with-nic-${nic2.model}`,
  namespace: TEST_NS,
  nics: [nic2],
  template: TEMPLATE.RHEL9,
};

adminOnlyDescribe('Test linux bridge NAD', () => {
  before(() => {
    cy.visitNAD();
    cy.deleteVMs([testVM1, testVM2]);
  });

  after(() => {
    cy.deleteVMs([testVM1, testVM2]);
  });

  it('ID(CNV-3256) create NAD with MAC Spoof checked', () => {
    createNAD(NAD_BRIDGE);
  });

  nnsIT('create VMs with bridge network', () => {
    vm.customizeCreate(testVM1);
    vm.customizeCreate(testVM2);
  });

  nnsIT(
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

  nnsIT(`visit ${testVM1.name}`, () => {
    cy.byLegacyTestID(testVM1.name).click();
  });

  nnsIT(
    'ID(CNV-) verify vm is up with the correct ip address',
    {
      retries: {
        openMode: 2,
        runMode: 5,
      },
    },
    () => {
      cy.contains('.VirtualMachinesOverviewTabInterfaces--main', testVM1.ipAddr, {
        timeout: MINUTE,
      }).should('exist');
    },
  );

  nnsIT(
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

  nnsIT(`visit ${testVM2.name}`, () => {
    cy.byLegacyTestID(testVM2.name).click();
  });

  nnsIT(
    'ID(CNV-) verify vm is up with the correct ip address',
    {
      retries: {
        openMode: 2,
        runMode: 10,
      },
    },
    () => {
      cy.contains('.VirtualMachinesOverviewTabInterfaces--main', testVM2.ipAddr, {
        timeout: MINUTE,
      }).should('exist');
    },
  );

  nnsIT('stop VMs', () => {
    cy.patchVM(testVM1.name, 'Halted');
    cy.patchVM(testVM2.name, 'Halted');
  });
});
