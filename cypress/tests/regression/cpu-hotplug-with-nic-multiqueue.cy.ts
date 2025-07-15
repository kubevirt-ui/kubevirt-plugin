// Test for issue: https://issues.redhat.com/browse/CNV-56802

import { VirtualMachineData } from '../../types/vm';
import { TEST_NS } from '../../utils/const/index';
import { TEMPLATE } from '../../utils/const/template';
import * as vmView from '../../views/selector-common';
import { tab } from '../../views/tab';
import { vm } from '../../views/vm-flow';

const CPU = '3';
const LARGE_VM: VirtualMachineData = {
  allTemplate: true,
  mem: '4', // set mem to '4' due to test cluster limitation
  name: 'vm-nic-multi-queque',
  namespace: TEST_NS,
  template: TEMPLATE.RHEL9_LARGE,
};

describe('Test VM with networkInterfaceMultiqueue enabled', () => {
  before(() => {
    cy.beforeSpec();
    cy.visitCatalogVirt();
  });

  it('create a VM with networkInterfaceMultiqueque', () => {
    vm.customizeCreate(LARGE_VM);
  });

  it(
    'verify the VM is up completely',
    {
      retries: {
        runMode: 8,
      },
    },
    () => {
      cy.wait(30000); // wait for VM up periodly
      cy.contains(vmView.vmOSOnOverview, 'Red Hat Enterprise Linux').should('exist');
      cy.byLegacyTestID(LARGE_VM.template.metadataName).should('exist');
    },
  );

  it('edit cpu to trigger cpu hotplug', () => {
    tab.navigateToConfigurationDetails();
    cy.get(vmView.cpuMem).click();
    cy.get(vmView.cpuInput).clear().type(CPU);
    cy.clickSaveBtn();
    cy.wait(3000);
  });

  it('verify cpu is updated in VMI', () => {
    cy.contains('Pending changes').should('not.exist');
    const spec = '.spec.domain.cpu.cores';
    cy.checkVMISpec(LARGE_VM.name, spec, CPU, true);
  });
});
