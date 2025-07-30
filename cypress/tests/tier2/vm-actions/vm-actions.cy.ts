import { VirtualMachineData } from '../../../types/vm';
import { MINUTE, SECOND, TEST_NS } from '../../../utils/const/index';
import { VM_EXAMPLE } from '../../../utils/const/testVM';
import { action } from '../../../views/actions';
import { treeNode, vmName, vmOSOnOverview } from '../../../views/selector-common';
import { tab } from '../../../views/tab';

export const VM_CLONE: VirtualMachineData = {
  name: 'cloned-vm',
  namespace: TEST_NS,
};

describe('Test VM actions', () => {
  before(() => {
    cy.exec(
      `oc label vm ${VM_CLONE.name} -n ${TEST_NS} kubevirt.io/vm-delete-protection=false --overwrite`,
      { failOnNonZeroExit: false },
    );
    cy.deleteVMs([VM_CLONE]);
    cy.beforeSpec();
  });

  after(() => {
    cy.exec(
      `oc label vm ${VM_CLONE.name} -n ${TEST_NS} kubevirt.io/vm-delete-protection=false --overwrite`,
      { failOnNonZeroExit: false },
    );
    cy.deleteVMs([VM_CLONE]);
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

  it('clone VM', () => {
    cy.contains(treeNode, TEST_NS).click();
    action.clone(VM_EXAMPLE.name, VM_CLONE.name, true);
    cy.contains(vmName, VM_CLONE.name, { timeout: 3 * MINUTE }).should('exist');
    cy.wait(30 * SECOND);
  });

  it(
    'ID(CNV-8885) verify OS of cloned VM',
    {
      retries: {
        openMode: 10,
        runMode: 10,
      },
    },
    () => {
      cy.contains(vmOSOnOverview, 'Red Hat Enterprise Linux', { timeout: MINUTE }).should('exist');
    },
  );

  it('stop the VM', () => {
    cy.stopVM([VM_CLONE.name]);
  });

  it('ID(CNV-11875) set the delete protection', () => {
    tab.navigateToConfigurationDetails();
    cy.get('#deletion-protection').should('not.be.checked');
    cy.get('label[for="deletion-protection"]').click();
    cy.checkTitle('Enable deletion protection?');
    cy.byButtonText('Enable').click();
    cy.get('#deletion-protection').should('be.checked');
  });

  it('ID(CNV-11877) verify the delete protection', () => {
    cy.byButtonText('Actions').click();
    cy.byButtonText('Delete').should('be.disabled');
  });

  it('ID(CNV-11878) unset the delete protection', () => {
    cy.get('#deletion-protection').should('be.checked');
    cy.get('label[for="deletion-protection"]').click();
    cy.checkTitle('Disable deletion protection?');
    cy.byButtonText('Disable').click();
    cy.get('#deletion-protection').should('not.be.checked');
  });

  it('ID(CNV-11879) delete the VM', () => {
    cy.byButtonText('Actions').click();
    cy.byButtonText('Delete').click();
    cy.checkTitle('Delete VirtualMachine?');
    cy.byButtonText('Delete').click();
  });
});
