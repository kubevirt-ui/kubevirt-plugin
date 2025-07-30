import { VirtualMachineData } from '../types/vm';
import { authSSHKey } from '../utils/const/string';

import { tabModal } from './actions';
import { addDisk, addNic } from './modals';
import * as cView from './selector-catalog';
import * as vmView from './selector-common';
import { plusBtn } from './selector-overview';
import { tab } from './tab';

export const editVMDetails = (vmData: VirtualMachineData) => {
  const {
    bootMode,
    cpu,
    description,
    gpu,
    headless,
    hostname,
    mem,
    name,
    sshOverLB,
    sshOverNodeport,
    startInPause,
    workload,
  } = vmData;
  if (description) {
    cy.get(vmView.desc(name)).click();
    cy.get(tabModal).find('.pf-v6-c-modal-box__body > textarea').clear().type(description);
    cy.clickSaveBtn();
    cy.wait(3000);
  }
  if (cpu || mem) {
    cy.get(vmView.cpuMem).click();
    if (cpu) {
      cy.get(vmView.cpuField).find(plusBtn).click();
    }
    if (mem) {
      cy.get(vmView.memField).find(plusBtn).click();
    }
    cy.clickSaveBtn();
    cy.wait(3000);
  }
  if (bootMode) {
    cy.contains('Boot management').click();
    cy.get(vmView.bootMode(name)).click();
    cy.get(tabModal).find('.pf-v6-c-menu-toggle').click();
    cy.contains(vmView.menuItemMain, bootMode).click();
    cy.clickSaveBtn();
    cy.wait(3000);
  }
  if (workload) {
    cy.get(vmView.workload(name)).click();
    cy.get(tabModal).find('.pf-v6-c-menu-toggle').click();
    cy.contains(vmView.menuItemMain, workload).click();
    cy.clickSaveBtn();
    cy.wait(3000);
  }
  if (gpu) {
    cy.byButtonText('GPU devices').click();
    cy.byButtonText('Add GPU device').click();
    cy.get('button[aria-label="Options menu"]').click();
    cy.byButtonText('nvidia.com').click();
    cy.get('input#name').clear().type('vgpu_test');
    cy.get('button.pf-m-plain>svg[viewBox="0 0 512 512"]').click();
    cy.get('[data-test-rows="resource-row"]').contains('vgpu_test').should('exist');
    cy.clickSaveBtn();
    cy.get('.hardware-devices-table').should('contain', 'vgpu_test');
    cy.wait(3000);
  }
  if (startInPause) {
    cy.contains('Boot management').click();
    cy.get(cView.startInPause).check({ force: true });
    cy.wait(3000);
  } else if (startInPause === false) {
    cy.contains('Boot management').click();
    cy.get(cView.startInPause).uncheck({ force: true });
    cy.wait(3000);
  }
  if (hostname) {
    cy.get(vmView.hostname(name)).click();
    cy.get(vmView.hostnameInput).clear().type(hostname);
    cy.clickSaveBtn();
    cy.wait(3000);
  }
  if (headless) {
    cy.get(cView.headlessMode).check({ force: true });
    cy.wait(3000);
  } else if (headless === false) {
    cy.get(cView.headlessMode).uncheck({ force: true });
    cy.wait(3000);
  }
  if (sshOverNodeport) {
    tab.navigateToConfigurationSSH();
    cy.contains(authSSHKey).click();
    cy.get(vmView.sshTypeSelect).click();
    cy.get(vmView.sshTypeNodeport).click();
    cy.wait(3000);
  }
  if (sshOverLB) {
    tab.navigateToConfigurationSSH();
    cy.contains(authSSHKey).click();
    cy.get(vmView.sshTypeSelect).click();
    cy.get(vmView.sshTypeLB).click();
    cy.wait(3000);
  }
};

export const editVMEnvironment = (vmData: VirtualMachineData) => {
  const { addEnvDisk } = vmData;
  if (addEnvDisk) {
    tab.navigateToConfigurationStorage();
    cy.contains('Add Config Map, Secret or Service Account').click();
    cy.contains('Select a resource').click();
    cy.get('.pf-c-select__menu-group-title').eq(0).parent().find('ul>li').first().click();
    cy.contains('Add Config Map, Secret or Service Account').click();
    cy.contains('Select a resource').click();
    cy.get('.pf-c-select__menu-group-title').eq(1).parent().find('ul>li').first().click();
    cy.contains('Add Config Map, Secret or Service Account').click();
    cy.contains('Select a resource').click();
    cy.get('.pf-c-select__menu-group-title').eq(2).parent().find('ul>li').first().click();
    cy.clickSubmitBtn();
    cy.contains('Success').should('exist');
  }
};

export const editVMScheduling = (vmData: VirtualMachineData) => {
  const { dedicatedResources, descheduler, evictionStrategy } = vmData;
  if (descheduler || dedicatedResources || evictionStrategy) {
    tab.navigateToConfigurationScheduling();
  }
  if (descheduler) {
    cy.get(vmView.deschedulerEditBtn).click();
    cy.get(vmView.deschedulerCheckBox).check();
    cy.clickSaveBtn();
    cy.wait(3000);
  }
  if (dedicatedResources) {
    cy.get(vmView.dedicatedResourceEditBtn).click();
    cy.get(vmView.dedicatedResourceCheckBox).check();
    cy.clickSaveBtn();
    cy.wait(3000);
  }
  if (evictionStrategy !== undefined && !evictionStrategy) {
    cy.get(vmView.evictionStrategyEditBtn).click();
    cy.get(vmView.evictionStrategyCheckBox).uncheck();
    cy.clickSaveBtn();
    cy.wait(3000);
  }
};

// add nic with nad created in setup
export const editVMNetwork = (vmData: VirtualMachineData) => {
  if (vmData.nics) {
    tab.navigateToConfigurationNetwork();
    vmData.nics.forEach((nic) => {
      addNic(nic);
      cy.wait(3000);
    });
  }
};

export const editVMDisks = (vmData: VirtualMachineData) => {
  if (vmData.disks) {
    tab.navigateToConfigurationStorage();
    vmData.disks.forEach((disk) => {
      addDisk(disk);
      cy.wait(3000);
    });
  }
};
