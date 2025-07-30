import { VirtualMachineData } from '../types/vm';
import * as index from '../utils/const/index';

import { action, DELETE } from './actions';
import * as catalog from './catalog-flow';
import * as instance from './instance-flow';
import * as cView from './selector-catalog';
import { kebabBtn, vmStatusOnList, vmStatusTop } from './selector-common';
import * as iView from './selector-instance';
import { tab } from './tab';

export const getRow = (name: string, within: VoidFunction) =>
  cy.byTestRows('resource-row').contains(name).parents('tr').within(within);

export const checkStatus = (
  vmName: string,
  vmStatus: string,
  timeout: index.ACTION_TIMEOUT,
  onList = true,
) => {
  if (onList) {
    getRow(vmName, () =>
      cy.contains(vmStatusOnList, vmStatus, { timeout: timeout }).should('exist'),
    );
  } else {
    cy.contains(vmStatusTop, vmStatus, {
      timeout: timeout,
    }).should('exist');
  }
};

export const waitForStatus = (vmName: string, status: string, onList = true) => {
  switch (status) {
    case index.VM_STATUS.Running: {
      checkStatus(vmName, index.VM_STATUS.Running, index.ACTION_TIMEOUT.START, onList);
      // wait for vmi appear
      cy.wait(3000);
      break;
    }
    case index.VM_STATUS.Provisioning: {
      checkStatus(vmName, index.VM_STATUS.Provisioning, index.ACTION_TIMEOUT.IMPORT, onList);
      if (onList) {
        getRow(vmName, () =>
          cy
            .contains(vmStatusOnList, index.VM_STATUS.Provisioning, {
              timeout: index.ACTION_TIMEOUT.IMPORT,
            })
            .should('not.exist'),
        );
      } else {
        cy.contains(vmStatusTop, index.VM_STATUS.Provisioning, {
          timeout: index.ACTION_TIMEOUT.IMPORT,
        }).should('not.exist');
      }
      break;
    }
    case index.VM_STATUS.Stopped: {
      checkStatus(vmName, index.VM_STATUS.Stopped, index.ACTION_TIMEOUT.STOP, onList);
      break;
    }
    case index.VM_STATUS.Starting: {
      checkStatus(vmName, index.VM_STATUS.Starting, index.ACTION_TIMEOUT.START, onList);
      break;
    }
    case index.VM_STATUS.Migrating: {
      checkStatus(vmName, index.VM_STATUS.Migrating, index.ACTION_TIMEOUT.Migrating, onList);
      break;
    }
    default: {
      checkStatus(vmName, status, index.ACTION_TIMEOUT.IMPORT, onList);
      break;
    }
  }
};

export const vm = {
  create: (vmData: VirtualMachineData, waitForRunning = true) => {
    cy.visitCatalog();
    cy.get(cView.templateTab).click();
    cy.switchProject(vmData.namespace);
    if (vmData.userTemplate) {
      cy.get(cView.uTemplate).click();
    }
    // cy.get(`[data-test-id="boot-source-available-Boot source available"]`)
    //   .find(':checkbox')
    //   .check();
    cy.get(`div[data-test-id="${vmData.template.metadataName}"]`).click();
    // wait for page is loaded completely
    cy.wait(5000);
    if (vmData.folder) {
      cy.get(cView.quickForm).within(() => {
        cy.get(iView.vmFolder).type(vmData.folder);
      });
      cy.get(iView.vmFolderMenu).find('button').eq(0).click();
    }
    catalog.fillReviewAndCreate(vmData);
    if (vmData.mountWinDriver !== undefined && vmData.mountWinDriver === false) {
      cy.get(cView.winDrivers).uncheck();
    }
    if (!vmData.startOnCreation && vmData.startOnCreation !== undefined) {
      cy.get(cView.quickForm).find(cView.startOnCreation).uncheck();
    }
    cy.get(cView.quickCreateVMBtn).click();
    cy.get('[data-test="global-notifications"]').scrollIntoView();
    if (waitForRunning && vmData.startOnCreation !== false) {
      // wait here for other state showing before running
      // cy.wait(90000);
      checkStatus(vmData.name, index.VM_STATUS.Running, 3 * index.MINUTE, false);
      // wait for vmi appear
      cy.wait(3000);
    }
  },
  customizeCreate: (vmData: VirtualMachineData, waitForRunning = true) => {
    cy.visitCatalog();
    cy.switchProject(vmData.namespace);
    cy.get(cView.templateTab).click();
    cy.get(`[data-test-id="boot-source-available-Boot source available"]`)
      .find(':checkbox')
      .check();
    if (vmData.userTemplate) {
      cy.get(cView.uTemplate).click();
    }
    if (vmData.allTemplate) {
      cy.get(cView.aTemplate).click();
    }
    cy.get(cView.searchCatalog).type(vmData.template.metadataName);
    cy.get(`div[data-test-id="${vmData.template.metadataName}"]`).click();
    catalog.fillReviewAndCreate(vmData);
    cy.get(cView.customizeVMBtn).click();
    catalog.fillOverview(vmData);
    catalog.fillScheduling(vmData);
    catalog.fillEnvironment(vmData);
    catalog.addNetwork(vmData);
    catalog.addDisks(vmData);
    catalog.fillScripts(vmData);
    catalog.fillMetadata(vmData);
    tab.navigateToOverview();
    if (!vmData.startOnCreation && vmData.startOnCreation !== undefined) {
      cy.get(cView.startOnCreation).click();
    }
    cy.byButtonText(cView.createBtnText).click({ force: true });
    cy.get('body').then(($body) => {
      if ($body.text().includes(cView.createBtnText)) {
        cy.byButtonText(cView.createBtnText).click({ force: true });
      }
    });
    cy.get('body').then(($body) => {
      if ($body.text().includes('No available boot source')) {
        cy.byButtonText(cView.createWithNoBS).click();
      }
    });
    cy.get('[data-test="global-notifications"]').scrollIntoView();
    if (waitForRunning && vmData.startOnCreation !== false) {
      // wait here for other state showing before running
      // cy.wait(90000);
      checkStatus(vmData.name, index.VM_STATUS.Running, 3 * index.MINUTE, false);
      // wait for vmi appear
      cy.wait(3000);
    }
  },
  customizeIT: (vmData: VirtualMachineData, waitForRunning = true) => {
    cy.visitCatalog();
    cy.switchProject(vmData.namespace);
    instance.customizeIT(vmData);
    if (!vmData.startOnCreation && vmData.startOnCreation !== undefined) {
      cy.get(cView.startOnCreation).uncheck();
    }
    cy.byButtonText(iView.createBtnText).click({ force: true });
    cy.get('[data-test="global-notifications"]').scrollIntoView();
    if (waitForRunning && vmData.startOnCreation !== false) {
      // wait here for other state showing before running
      // cy.wait(90000);
      checkStatus(vmData.name, index.VM_STATUS.Running, 3 * index.MINUTE, false);
      // wait for vmi appear
      cy.wait(3000);
    }
  },
  delete: (vmName: string, gracePeriod?: string, skipDeleteDisk?: boolean) => {
    getRow(vmName, () => cy.get(kebabBtn).click());
    cy.byLegacyTestID(DELETE).click();
    if (gracePeriod) {
      cy.get('input[id="grace-period-checkbox"]').check();
      cy.get('input[data-test="grace-period-seconds-input"]').clear().type(gracePeriod);
    }
    if (skipDeleteDisk) {
      cy.get('input[id="delete-owned-resources"]').uncheck();
    }
    cy.byButtonText('Delete').click();
  },
  instanceCreate: (vmData: VirtualMachineData, waitForRunning = true) => {
    cy.visitCatalog(); // navigate back
    cy.switchProject(vmData.namespace);
    instance.fillInstanceType(vmData);
    if (!vmData.startOnCreation && vmData.startOnCreation !== undefined) {
      cy.get(iView.startBtn).uncheck();
    }
    cy.byButtonText(iView.createBtnText).click({ force: true });
    cy.get('[data-test="global-notifications"]').scrollIntoView();
    if (waitForRunning && vmData.startOnCreation !== false) {
      // wait here for other state showing before running
      // cy.wait(90000);
      checkStatus(vmData.name, index.VM_STATUS.Running, 3 * index.MINUTE, false);
      // wait for vmi appear
      cy.wait(3000);
    }
  },
  migrate: (vmName: string, waitForComplete = true) => {
    waitForStatus(vmName, index.VM_STATUS.Running);
    action.migrate(vmName);
    if (waitForComplete) {
      waitForStatus(vmName, index.VM_STATUS.Migrating);
      waitForStatus(vmName, index.VM_STATUS.Running);
    }
  },
};
