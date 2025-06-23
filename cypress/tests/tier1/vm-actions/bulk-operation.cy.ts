import { SECOND, VM_ACTION, VM_STATUS } from '../../../utils/const/index';
import { VM_IT_CUST, VM_IT_QUICK, VM_TMPL_CUST, VM_TMPL_QUICK } from '../../../utils/const/testVM';
import { getRow, MIGRATE_MENU, MIGRATE_STORAGE } from '../../../views/actions';
import { storageclassMigrate } from '../../../views/migrate-modal';
import * as nav from '../../../views/selector';
import { selectAllDropdownOption, selectDropdownToggle } from '../../../views/selector-common';
import { tab } from '../../../views/tab';
import { waitForStatus } from '../../../views/vm-flow';

const destSC = 'hostpath-csi-basic';

describe('Test bulk actions', () => {
  before(() => {
    cy.login();
    cy.visit('');
    cy.visitVMs();
  });

  it('stop all VMs by selection', () => {
    cy.get(selectDropdownToggle).click();
    cy.get(selectAllDropdownOption).click();
    cy.byButtonText('Actions').click();
    cy.byButtonText(VM_ACTION.Stop).click();
    cy.wait(30 * SECOND);
    cy.clickVirtLink(nav.catalogNav);
    cy.wait(30 * SECOND);
    cy.clickVirtLink(nav.vmNav);
    waitForStatus(VM_TMPL_QUICK.name, VM_STATUS.Stopped);
    waitForStatus(VM_TMPL_CUST.name, VM_STATUS.Stopped);
    waitForStatus(VM_IT_QUICK.name, VM_STATUS.Stopped);
    waitForStatus(VM_IT_CUST.name, VM_STATUS.Stopped);
  });

  it('bulk storageclass migration', () => {
    getRow(VM_TMPL_QUICK.name, () => cy.get('input[type="checkbox"]').check({ force: true }));
    getRow(VM_IT_QUICK.name, () => cy.get('input[type="checkbox"]').check({ force: true }));
    cy.byButtonText('Actions').click();
    cy.byButtonText(MIGRATE_MENU).click();
    cy.get(MIGRATE_STORAGE).click();
    storageclassMigrate(destSC);
  });

  it('ID(CNV-11626) verify the storageclass of the disks', () => {
    cy.byLegacyTestID(VM_IT_QUICK.name).click();
    tab.navigateToConfigurationStorage();
    getRow('rootdisk', () => cy.contains(destSC, { timeout: 60000 }).should('exist'));
  });
});
