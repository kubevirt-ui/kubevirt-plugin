import { NIC } from '../../../types/vm';
import { MINUTE, nnsDescribe, SECOND, VM_STATUS } from '../../../utils/const/index';
import { NAD_OVN } from '../../../utils/const/nad';
import { pending } from '../../../utils/const/string';
import { VM_EXAMPLE } from '../../../utils/const/testVM';
import { MIGRATE_COMPUTE } from '../../../views/actions';
import { addNic } from '../../../views/modals';
import { tab } from '../../../views/tab';
import { waitForStatus } from '../../../views/vm-flow';

export const nic: NIC = {
  model: 'e1000e',
  name: 'nic-ovn-e1000e',
  network: NAD_OVN.name,
};

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
    addNic(nic);
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
    cy.contains(nic.name).should('exist');
  });
});
