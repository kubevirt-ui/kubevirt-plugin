import { TemplateData } from '../types/vm';
import { authSSHKey, cloudInit } from '../utils/const/string';

import { action, tabModal } from './actions';
import { addDisk, addNic } from './modals';
import * as cView from './selector-catalog';
import { descrGroup } from './selector-common';
import * as iView from './selector-instance';
import * as tView from './selector-template';
import { tab, tabName } from './tab';

export const getRow = (name: string, within: VoidFunction) =>
  cy.byTestRows('resource-row').contains(name).parents('tr').within(within);

export const template = {
  clone: (sourceT: string, tData: TemplateData) => {
    cy.byLegacyTestID(sourceT).click();
    cy.checkTitle(sourceT);
    cy.byButtonText('Actions').click();
    cy.contains('Clone').click();
    // select project does not work without proper selector
    cy.get(tabModal).within(() => {
      cy.get(tView.cloneVMName).clear().type(tData.metadataName);
      if (tData.name) {
        cy.get(tView.displayName).clear().type(tData.name);
      }
      if (tData.namespace) {
        cy.get('button.pf-v5-c-menu-toggle[placeholder="Select project"]').click();
        cy.contains(cView.menuItem, tData.namespace).click();
      }
      if (tData.provider) {
        cy.get(tView.provider).clear().type(tData.provider);
      }
      cy.byButtonText('Clone').click();
    });
    cy.get(`[data-test-id=${tabName.Scheduling}]`).should('exist');
  },
  delete: (tName: string) => {
    action.deleteTemplate(tName);
  },
  editDetails: (tData: TemplateData) => {
    // edit cpu
    if (tData.cpu) {
      cy.byButtonText('CPU').click();
      cy.get('input[name="cpu-input"]').clear().type(tData.cpu);
      cy.get('input[name="memory-input"]').clear().type(tData.mem);
      cy.clickSaveBtn();
    }
    cy.wait(3000); // wait for backend update the VM

    // edit bootmode
    if (tData.bootMode) {
      cy.contains(descrGroup, 'Boot mode').find('button').click();
      cy.get(tabModal).find(cView.menuToggle).click();
      cy.contains(cView.menuItem, tData.bootMode).click();
      cy.clickSaveBtn();
      cy.wait(3000); // wait for backend update the VM
    }

    // edit workload
    if (tData.workload) {
      cy.contains(descrGroup, 'Workload profile').find('button').click();
      cy.get(tabModal).find(cView.menuToggle).click();
      cy.contains(cView.menuItem, tData.workload).click();
      cy.clickSaveBtn();
      cy.wait(3000); // wait for backend update the VM
    }
    // enable headless
    if (tData.headless) {
      // cy.get(tView.headlessEditBtn).click();
      cy.get(tView.enableHeadless).check();
      // cy.clickSaveBtn();
      // cy.wait(3000); // wait for backend update the VM
    }
  },
  editDisks: (tData: TemplateData) => {
    if (tData.disks) {
      tab.navigateToTDisks();
      tData.disks.forEach((disk) => {
        addDisk(disk);
        cy.wait(3000);
      });
    }
  },
  editNetworks: (tData: TemplateData) => {
    if (tData.nics) {
      tab.navigateToTNetworks();
      tData.nics.forEach((nic) => {
        addNic(nic);
        cy.wait(3000);
      });
    }
  },
  editScheduling: (tData: TemplateData) => {
    if (tData.dedicatedResources) {
      tab.navigateToTScheduling();
      cy.contains(descrGroup, 'Dedicated resources').find('button').click();
      // cy.get(tView.dedicatedResEditBtn).click();
      cy.get(tView.enableDedicatedRes).check();
      cy.clickSaveBtn();
      cy.wait(3000); // wait for backend update the VM
    }
    if (tData.evictionStrategy) {
      tab.navigateToTScheduling();
      cy.contains(descrGroup, 'Eviction strategy').find('button').click();
      // cy.get(tView.liveMigrateEditBtn).click();
      cy.get(tView.disableLMBtn).uncheck();
      cy.clickSaveBtn();
      cy.wait(3000); // wait for backend update the VM
    }
  },
  editScripts: (tData: TemplateData) => {
    if (
      tData.cloudInitUname ||
      tData.cloudInitPwd ||
      tData.ethName ||
      tData.ipAddr ||
      tData.gateway ||
      tData.newSecret ||
      tData.existSecret
    ) {
      tab.navigateToTScripts();
    }
    if (
      tData.cloudInitUname ||
      tData.cloudInitPwd ||
      tData.ethName ||
      tData.ipAddr ||
      tData.gateway
    ) {
      // tab.navigateToTScripts();
      // cy.byButtonText('Edit').click();
      cy.contains(descrGroup, cloudInit).find('button').eq(0).click();
      cy.get(tView.username).clear().type(tData.cloudInitUname);
      cy.get(tView.userpasswd).clear().type(tData.cloudInitPwd);
      if (tData.ethName || tData.ipAddr || tData.gateway) {
        // add network data always
        cy.get(tView.network).check();
        if (tData.ethName) {
          cy.get(tView.ethName).type(tData.ethName);
        }
        if (tData.ipAddr) {
          cy.get(tView.ipAddress).type(tData.ipAddr);
        }
        if (tData.gateway) {
          cy.get(tView.ipGateway).type(tData.gateway);
        }
      }
      cy.byButtonText('Apply').click();
      cy.wait(3000);
    }
    if (tData.newSecret) {
      // tab.navigateToTScripts();
      // cy.contains(authSSHKey).parent().parent().find('button').click();
      cy.contains(descrGroup, authSSHKey).find('button').eq(0).click();
      cy.get(iView.addNew).click();
      cy.dropFile('./fixtures/rsa.pub', 'rsa.pub', cView.uploadSecret);
      cy.wait(3000);
      cy.get(cView.secretName).clear().type(tData.newSecret);
      cy.clickSaveBtn();
      cy.wait(3000);
    }
    // https://bugzilla.redhat.com/show_bug.cgi?id=2187664
    if (tData.existSecret) {
      // tab.navigateToTScripts();
      // cy.contains(authSSHKey).parent().parent().find('button').click();
      cy.contains(descrGroup, authSSHKey).find('button').eq(0).click();
      cy.get(iView.useExisting).click();
      cy.contains(iView.selectSecretText).click();
      cy.contains(tData.existSecret).click();
      cy.clickSaveBtn();
      cy.wait(3000);
    }
  },
  testSourceAvailable: (tName: string, available = true) => {
    if (available) {
      getRow(tName, () => cy.contains('Clone in progress').should('exist'));
      getRow(tName, () => cy.contains('Source available').should('exist'));
    } else {
      getRow(tName, () => cy.contains('Source available').should('not.exist'));
    }
  },
};

export const editTemplate = (tData: TemplateData) => {
  template.editDetails(tData);
  template.editScheduling(tData);
  template.editNetworks(tData);
  template.editDisks(tData);
  template.editScripts(tData);
};
