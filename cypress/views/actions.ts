import * as sel from './selector-common';
export const vmActions = '.pf-v6-c-table__action';
export const START = 'vm-action-start';
export const RESTART = 'vm-action-restart';
export const STOP = 'vm-action-stop';
export const FSTOP = 'vm-action-force-stop';
export const PAUSE = 'vm-action-pause';
export const UNPAUSE = 'vm-action-unpause';
export const CLONE = 'vm-action-clone';
export const CONTROL_MENU = 'control-menu';
export const MIGRATE_MENU = '[data-test-id="migration-menu"]';
export const MIGRATE_COMPUTE = 'vm-action-migrate';
export const BULK_MIGRATE = '[data-test-id="vms-bulk-migrate-storage"]';
export const SNAPSHOT = 'vm-action-snapshot';
export const CANCEL = 'vm-action-cancel-migrate';
export const DELETE = 'vm-action-delete';
export const COPYSSH = 'vm-action-copy-ssh';
export const ActionStart = '[data-test-id="selected-vms-action-start"]';
export const ActionStop = '[data-test-id="selected-vms-action-stop"]';
export const kebabBtn = '[data-test-id="kebab-button"]';

export const tabModal = '#tab-modal';
export const startClone = '#start-clone';
export const nameInput = 'input#name';
export const colName = 'td#name';
export const favName = 'td#favorites';
export const providerInput = 'input#provider';

export const getRow = (name: string, within: VoidFunction) =>
  cy.byTestRows('resource-row').contains(name).parents('tr').within(within);

const getActionRoot = (vmName: string, onList = true) =>
  onList
    ? getRow(vmName, () => cy.get(sel.actionsBtn).click())
    : cy.byButtonText('Actions').click();

export const action = {
  clone: (vmName: string, newName = '', startOnClone = false, onList = true) => {
    getActionRoot(vmName, onList).byTestActionID(CLONE).click();
    cy.get(tabModal).within(() => {
      if (newName) {
        cy.get(nameInput).clear().type(newName);
      }
      if (startOnClone) {
        cy.get(startClone).check();
      }
      cy.clickCloneBtn();
    });
  },
  cloneTemplate: (tName) => {
    getRow(tName, () => cy.get(sel.actionsBtn).click())
      .contains('Clone')
      .click();
  },
  delete: (vmName: string, onList = true) => {
    getActionRoot(vmName, onList).byTestActionID(DELETE).click();
  },
  deleteTemplate: (tName) => {
    getRow(tName, () => cy.get(sel.actionsBtn).click())
      .contains('Delete')
      .click();
  },
  EditTemplateBS: (tName) => {
    getRow(tName, () => cy.get(sel.actionsBtn).click())
      .contains('Edit boot source')
      .click();
  },
  EditTemplateBSR: (tName) => {
    getRow(tName, () => cy.get(sel.actionsBtn).click())
      .contains('Edit boot source reference')
      .click();
  },
  fstop: (vmName: string, onList = true) => {
    getActionRoot(vmName, onList)
      .byTestActionID(CONTROL_MENU)
      .trigger('mouseover')
      .byTestActionID(FSTOP)
      .click();
  },
  migrate: (vmName: string, onList = true) => {
    getActionRoot(vmName, onList)
      .byButtonText('Migration')
      .trigger('mouseover')
      .byTestActionID(MIGRATE_COMPUTE)
      .click();
  },
  pause: (vmName: string, onList = true) => {
    getActionRoot(vmName, onList)
      .byTestActionID(CONTROL_MENU)
      .trigger('mouseover')
      .byTestActionID(PAUSE)
      .click();
  },
  restart: (vmName: string, onList = true) => {
    getActionRoot(vmName, onList)
      .byTestActionID(CONTROL_MENU)
      .trigger('mouseover')
      .byTestActionID(RESTART)
      .click();
  },
  start: (vmName: string, onList = true) => {
    getActionRoot(vmName, onList)
      .byTestActionID(CONTROL_MENU)
      .trigger('mouseover')
      .byTestActionID(START)
      .click();
  },
  stop: (vmName: string, onList = true) => {
    getActionRoot(vmName, onList)
      .byTestActionID(CONTROL_MENU)
      .trigger('mouseover')
      .byTestActionID(STOP)
      .click();
  },
  unpause: (vmName: string, onList = true) => {
    getActionRoot(vmName, onList)
      .byTestActionID(CONTROL_MENU)
      .trigger('mouseover')
      .byTestActionID(UNPAUSE)
      .click();
  },
};
