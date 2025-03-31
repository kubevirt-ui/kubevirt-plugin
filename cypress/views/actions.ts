import * as sel from './selector-common';
export const vmActions = '.dropdown-kebab-pf.pf-v6-c-table__action';
export const START = 'vm-action-start';
export const RESTART = 'vm-action-restart';
export const STOP = 'vm-action-stop';
export const FSTOP = 'vm-action-force-stop';
export const PAUSE = 'vm-action-pause';
export const UNPAUSE = 'vm-action-unpause';
export const CLONE = 'vm-action-clone';
export const MIGRATE_MENU = '[data-test-id="migration-menu"]';
export const MIGRATE_COMPUTE = 'vm-action-migrate';
export const MIGRATE_STORAGE = '[data-test-id="vm-migrate-storage"]';
export const SNAPSHOT = 'vm-action-snapshot';
export const CANCEL = 'vm-action-cancel-migrate';
export const DELETE = 'vm-action-delete';
export const COPYSSH = 'vm-action-copy-ssh';
export const ActionStart = '[data-test-id="selected-vms-action-start"]';
export const ActionStop = '[data-test-id="selected-vms-action-stop"]';

export const tabModal = '#tab-modal';
export const startClone = '#start-clone';
export const nameInput = 'input#name';
export const colName = 'td#name';
export const favName = 'td#favorites';
export const providerInput = 'input#provider';

export const getRow = (name: string, within: VoidFunction) =>
  cy.byTestRows('resource-row').contains(name).parents('tr').within(within);

export const deleteRow = (name: string) => {
  getRow(name, () => cy.get(sel.actionsBtn).click());
  cy.contains(sel.dropDownItem, 'Delete').click();
  cy.get(tabModal).within(() => {
    cy.checkTitle('Delete');
    cy.contains('strong', name).should('exist');
    cy.byButtonText('Delete').click();
  });
};

export const action = {
  clone: (vmName: string, newName = '', startOnClone = false, onList = true) => {
    if (onList) {
      getRow(vmName, () => cy.get(sel.actionsBtn).click());
    } else {
      cy.byButtonText('Actions').click();
    }
    cy.wait(1000);
    cy.byLegacyTestID(CLONE).click();
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
    getRow(tName, () => cy.get(sel.actionsBtn).click());
    cy.contains('Clone').click();
  },
  delete: (vmName: string, onList = true) => {
    if (onList) {
      getRow(vmName, () => cy.get(sel.actionsBtn).click());
    } else {
      cy.byButtonText('Actions').click();
    }
    cy.byLegacyTestID(DELETE).click();
    cy.byButtonText('Delete').click();
  },
  deleteTemplate: (tName) => {
    getRow(tName, () => cy.get(sel.actionsBtn).click());
    cy.contains('Delete').click();
    cy.byButtonText('Delete').click();
  },
  EditTemplateBS: (tName) => {
    getRow(tName, () => cy.get(sel.actionsBtn).click());
    cy.contains('Edit boot source').click();
  },
  EditTemplateBSR: (tName) => {
    getRow(tName, () => cy.get(sel.actionsBtn).click());
    cy.contains('Edit boot source reference').click();
  },
  fstop: (vmName: string, onList = true) => {
    if (onList) {
      getRow(vmName, () => cy.get(sel.actionsBtn).click());
    } else {
      cy.byButtonText('Actions').click();
    }
    cy.byLegacyTestID(FSTOP).click();
  },
  migrate: (vmName: string, onList = true) => {
    if (onList) {
      getRow(vmName, () => cy.get(sel.actionsBtn).click());
    } else {
      cy.byButtonText('Actions').click();
    }
    cy.byButtonText('Migration').click();
    cy.wait(500);
    cy.byLegacyTestID(MIGRATE_COMPUTE).click();
  },
  pause: (vmName: string, onList = true) => {
    if (onList) {
      getRow(vmName, () => cy.get(sel.actionsBtn).click());
    } else {
      cy.byButtonText('Actions').click();
    }
    cy.byLegacyTestID(PAUSE).click();
  },
  restart: (vmName: string, onList = true) => {
    if (onList) {
      getRow(vmName, () => cy.get(sel.actionsBtn).click());
    } else {
      cy.byButtonText('Actions').click();
    }
    cy.wait(3000);
    cy.byLegacyTestID(RESTART).click();
  },
  start: (vmName: string, onList = true) => {
    if (onList) {
      getRow(vmName, () => cy.get(sel.actionsBtn).click());
    } else {
      cy.byButtonText('Actions').click();
    }
    cy.byLegacyTestID(START).click();
  },
  stop: (vmName: string, onList = true) => {
    if (onList) {
      getRow(vmName, () => cy.get(sel.actionsBtn).click());
    } else {
      cy.byButtonText('Actions').click();
    }
    cy.wait(5000);
    cy.byLegacyTestID(STOP).click();
  },
  unpause: (vmName: string, onList = true) => {
    if (onList) {
      getRow(vmName, () => cy.get(sel.actionsBtn).click());
    } else {
      cy.byButtonText('Actions').click();
    }
    cy.byLegacyTestID(UNPAUSE).click();
  },
};
