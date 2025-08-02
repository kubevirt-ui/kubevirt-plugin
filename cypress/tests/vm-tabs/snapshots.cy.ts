import { VM_IT_CUST } from '../../utils/const/testVM';
import { vmActions } from '../../views/actions';
import { tab } from '../../views/tab';
import { getRow } from '../../views/vm-flow';

const vm_snapshot = 'vm-snapshot';
const vm_from_Snapshot = 'vm-from-snapshot';

describe('Test VM Snapshot', () => {
  before(() => {
    cy.visit('', { timeout: 90000 });
    cy.switchToVirt();
    cy.exec('oc delete VirtualMachineSnapshot --all -n auto-test-ns --ignore-not-found');
  });

  it(
    'visit VM',
    {
      retries: {
        runMode: 8,
      },
    },
    () => {
      cy.visitVMs();
      cy.byLegacyTestID(VM_IT_CUST.name).click();
    },
  );

  it('stop test VMs', () => {
    cy.patchVM(VM_IT_CUST.name, 'Halted');
  });

  it('ID(CNV-10716) take Snapshot in tab snapshots', () => {
    tab.navigateToSnapshots();
    cy.get('button').contains('Take snapshot').click();
    cy.get('input[id="name"]').clear().type(vm_snapshot);
    cy.clickSaveBtn();
    cy.contains('a', vm_snapshot).should('exist');
    cy.wait(20000);
  });

  it('ID(CNV-10646) create a VirtualMachine from the snapshot', () => {
    getRow(vm_snapshot, () => cy.get('td > button').click());
    cy.contains('Create VirtualMachine').click();
    cy.wait(3000);
    cy.get('input[id="name"]').clear().type(vm_from_Snapshot);
    cy.get('input[id="start-clone"]').check();
    cy.get('button.pf-v6-c-button.pf-m-primary.pf-m-progress').click({ force: true });
    cy.checkTitle(vm_from_Snapshot);
  });

  it(
    'visit VM',
    {
      retries: {
        runMode: 8,
      },
    },
    () => {
      cy.visitVMs();
      cy.byLegacyTestID(VM_IT_CUST.name).click();
    },
  );

  it('ID(CNV-) restore vm from snapshot', () => {
    tab.navigateToSnapshots();
    getRow(vm_snapshot, () => cy.get(vmActions).find('button').click());
    cy.contains('Restore VirtualMachine from snapshot').click();
    cy.byButtonText('Restore').click();
  });
});
