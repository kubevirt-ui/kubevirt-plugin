import { TEST_IT_VM, TEST_VM, VM_EXAMPLE } from '../../utils/const/testVM';
import { START } from '../../views/actions';
import { createBtn } from '../../views/selector-common';
import { vm } from '../../views/vm-flow';

describe('Create shared resources', () => {
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

  it('ID(CNV-9891) create example VM', () => {
    cy.byButtonText('Create VirtualMachine').click();
    cy.byButtonText('With YAML').click();
    cy.get(createBtn).click();
    cy.byButtonText('Actions').click();
    cy.byLegacyTestID(START).click();
  });

  it('ID(CNV-9891) create test VM from InstanceType', () => {
    vm.instanceCreate(TEST_IT_VM, false);
  });

  it('ID(CNV-9891) create test VM from Template', () => {
    vm.customizeCreate(TEST_VM);
  });

  it('stop test VMs', () => {
    cy.patchVM(VM_EXAMPLE.name, 'Halted');
    cy.patchVM(TEST_VM.name, 'Halted');
    cy.patchVM(TEST_IT_VM.name, 'Halted');
  });
});
