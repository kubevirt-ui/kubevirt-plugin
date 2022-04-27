import { VirtualMachineData } from '../types/vm';
import { ACTION_TIMEOUT, VM_STATUS } from '../utils/const/index';
import { NoBootSource } from '../utils/const/string';

import * as catalogView from './catalog';
import { detailsOnOverview, vmStatusOnList } from './selector';

export const getRow = (name: string, within: VoidFunction) =>
  cy.byTestRows('resource-row').contains(name).parents('tr').within(within);

export const waitForStatus = (status: string) => {
  switch (status) {
    case VM_STATUS.Running: {
      cy.contains(detailsOnOverview, VM_STATUS.Running, {
        timeout: ACTION_TIMEOUT.BOOTUP,
      }).should('exist');
      // wait for vmi appear
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(3000);
      break;
    }
    case VM_STATUS.Provisioning: {
      cy.contains(detailsOnOverview, VM_STATUS.Provisioning, {
        timeout: ACTION_TIMEOUT.IMPORT,
      }).should('exist');
      break;
    }
    case VM_STATUS.Stopped: {
      cy.contains(detailsOnOverview, VM_STATUS.Stopped, {
        timeout: ACTION_TIMEOUT.IMPORT,
      }).should('exist');
      break;
    }
    case VM_STATUS.Starting: {
      cy.contains(detailsOnOverview, VM_STATUS.Starting, {
        timeout: ACTION_TIMEOUT.IMPORT,
      }).should('exist');
      break;
    }
    default: {
      cy.contains(detailsOnOverview, status).should('exist');
      break;
    }
  }
};

export const fillReviewAndCreate = (vmData: VirtualMachineData) => {
  cy.get(catalogView.vmName).clear().type(vmData.name);
  switch (vmData.diskSource.name) {
    case 'URL': {
      cy.byButtonText('Default').click();
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
    if (vmData.startOnCreation) {
      waitForStatus(VM_STATUS.Provisioning);
      waitForStatus(VM_STATUS.Starting);
      waitForStatus(VM_STATUS.Running);
    }
  },
  testStatus: (vmName: string, status: string, waitTime = 60000) =>
    getRow(vmName, () =>
      cy.contains(vmStatusOnList, status, { timeout: waitTime }).should('be.exist'),
    ),
};
