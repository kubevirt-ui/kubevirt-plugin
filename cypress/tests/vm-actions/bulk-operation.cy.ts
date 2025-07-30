import { SECOND, VM_ACTION, VM_STATUS } from '../../utils/const/index';
import { VM_IT_CUST, VM_TMPL_CUST } from '../../utils/const/testVM';
import { BULK_MIGRATE, getRow } from '../../views/actions';
import { storageclassMigrate } from '../../views/migrate-modal';
import * as nav from '../../views/selector';
import {
  confirmBtn,
  selectAllDropdownOption,
  selectDropdownToggle,
} from '../../views/selector-common';
import { tab } from '../../views/tab';
import { waitForStatus } from '../../views/vm-flow';

const DESTINATION_STORAGE_CLASS = 'hostpath-csi-basic';
const VM_NAMES = [VM_IT_CUST.name, VM_TMPL_CUST.name];
const WAIT_TIME = 30 * SECOND;

describe('Test bulk actions', () => {
  before(() => {
    cy.startVM(VM_NAMES);
    cy.beforeSpec();
    cy.visitVMsVirt();
  });

  after(() => {
    cy.stopVM(VM_NAMES);
  });

  it('stop all VMs by selection', () => {
    // Select and stop all VMs
    cy.get(`[data-test-id=${VM_IT_CUST.name}]`).should('be.visible');
    cy.get(selectDropdownToggle).click();
    cy.get(selectAllDropdownOption).click();

    cy.byButtonText('Actions').click();
    cy.byButtonText(VM_ACTION.Stop).click();
    cy.get(confirmBtn).click();

    // Verify VMs are stopped
    cy.wait(WAIT_TIME);
    cy.clickVirtLink(nav.catalogNav);
    cy.wait(WAIT_TIME);
    cy.clickVirtLink(nav.vmNav);

    VM_NAMES.forEach((vmName) => waitForStatus(vmName, VM_STATUS.Stopped));
  });

  it('bulk storageclass migration', () => {
    // Select VMs for migration
    VM_NAMES.forEach((vmName) => {
      getRow(vmName, () => cy.get('input[type="checkbox"]').check({ force: true }));
    });

    // Perform migration
    cy.byButtonText('Actions').click();
    cy.contains('.pf-v6-c-menu__item-text', 'Migrate').click();
    cy.get(BULK_MIGRATE).click();
    storageclassMigrate(DESTINATION_STORAGE_CLASS);
  });

  it('ID(CNV-11626) verify the storageclass of the disks', () => {
    cy.byLegacyTestID(VM_IT_CUST.name).click();
    tab.navigateToConfigurationStorage();

    getRow('rootdisk', () => {
      cy.contains(DESTINATION_STORAGE_CLASS, { timeout: 60000 }).should('exist');
    });
  });
});
