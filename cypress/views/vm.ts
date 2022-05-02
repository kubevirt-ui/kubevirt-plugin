import { VirtualMachineData } from '../types/vm';
import { ACTION_TIMEOUT, VM_STATUS } from '../utils/const/index';
import { NoBootSource } from '../utils/const/string';

import * as catalogView from './catalog';
import { vmStatusOnDetails, vmStatusOnList } from './selector';
import { tab } from './tab';

export const getRow = (name: string, within: VoidFunction) =>
  cy.byTestRows('resource-row').contains(name).parents('tr').within(within);

// monitor vm status on details tab
// navigate to vm details tab before call it
export const waitForStatus = (status: string) => {
  switch (status) {
    case VM_STATUS.Running: {
      cy.contains(vmStatusOnDetails, VM_STATUS.Running, {
        timeout: ACTION_TIMEOUT.BOOTUP,
      }).should('exist');
      // wait for vmi appear
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(3000);
      break;
    }
    case VM_STATUS.Provisioning: {
      cy.contains(vmStatusOnDetails, VM_STATUS.Provisioning, {
        timeout: ACTION_TIMEOUT.IMPORT,
      }).should('exist');
      break;
    }
    case VM_STATUS.Stopped: {
      cy.contains(vmStatusOnDetails, VM_STATUS.Stopped, {
        timeout: ACTION_TIMEOUT.IMPORT,
      }).should('exist');
      break;
    }
    case VM_STATUS.Starting: {
      cy.contains(vmStatusOnDetails, VM_STATUS.Starting, {
        timeout: ACTION_TIMEOUT.IMPORT,
      }).should('exist');
      break;
    }
    default: {
      cy.contains(vmStatusOnDetails, status).should('exist');
      break;
    }
  }
};

export const fillReviewAndCreate = (vmData: VirtualMachineData) => {
  cy.get(catalogView.vmName).clear().type(vmData.name);
  switch (vmData.diskSource.name) {
    case 'URL': {
      cy.get(catalogView.diskSourceSelect).click();
      cy.byLegacyTestID(vmData.diskSource.selectorID).click();
      cy.get(catalogView.diskSourceURL).type(vmData.diskSource.value);
      break;
    }
    default: {
      break;
    }
  }
};

export const vm = {
  create: (vmData: VirtualMachineData) => {
    cy.visitCatalog();
    cy.contains(catalogView.vmCatalog, vmData.template.metadataName).click();
    cy.get(catalogView.customizeVMBtn).click();
    fillReviewAndCreate(vmData);
    cy.get(catalogView.customizeVMSubmitBtn).click();
    cy.byButtonText(catalogView.createBtnText).click();
    cy.get('body').then(($body) => {
      if ($body.text().includes(NoBootSource)) {
        cy.byButtonText(catalogView.createWithNoBS).click();
      }
    });

    tab.navigateToDetails();
    if (vmData.startOnCreation) {
      waitForStatus(VM_STATUS.Provisioning);
      waitForStatus(VM_STATUS.Starting);
      waitForStatus(VM_STATUS.Running);
    }
  },
  visitVMI: (vmData: VirtualMachineData) => {
    cy.visitVMIs();
    getRow(vmData?.name, () => cy.byLegacyTestID(vmData?.name).click());
  },
  testStatus: (vmName: string, status: string, waitTime = 60000) =>
    getRow(vmName, () =>
      cy.contains(vmStatusOnList, status, { timeout: waitTime }).should('be.exist'),
    ),
};
