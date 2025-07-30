import { NIC } from '../../../types/vm';
import { nnsDescribe, SECOND, VM_STATUS } from '../../../utils/const/index';
import { NAD_OVN } from '../../../utils/const/nad';
import { pending } from '../../../utils/const/string';
import { VM_EXAMPLE } from '../../../utils/const/testVM';
import { action } from '../../../views/actions';
import { tab } from '../../../views/tab';
import { waitForStatus } from '../../../views/vm-flow';

export const nic: NIC = {
  model: 'e1000e',
  name: 'nic-ovn-e1000e',
  network: NAD_OVN.name,
};

// temporarily disabled as migration is broken
// nnsDescribe('Test network hotplug', () => {
xdescribe('Test network hotplug', () => {
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
    waitForStatus(VM_EXAMPLE.name, VM_STATUS.Running, true);
    cy.byLegacyTestID(VM_EXAMPLE.name).click();
    action.migrate(VM_EXAMPLE.name, false);
  });

  it(
    'wait for VMI migration complete',
    {
      retries: {
        runMode: 12,
      },
    },
    () => {
      cy.wait(10 * SECOND);
      cy.contains(pending).should('not.exist');
    },
  );

  it('ID(CNV-10789) verify network interface exists in VMI after migration', () => {
    tab.navigateToConfigurationNetwork();
    cy.contains(nic.name).should('exist');
  });
});
