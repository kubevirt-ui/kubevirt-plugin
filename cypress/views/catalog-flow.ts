import { VirtualMachineData } from '../types/vm';
import { authSSHKey, cloudInit, sysPrep } from '../utils/const/string';

import { getRow } from './actions';
import { addDisk, addNic } from './modals';
import * as cView from './selector-catalog';
import * as vmView from './selector-common';
import { cpuInput, descrGroup, memInput, row } from './selector-common';
import * as iView from './selector-instance';
import { tab } from './tab';

export const fillReviewAndCreate = (vmData: VirtualMachineData) => {
  const { bootFromCD, cdSource, cpu, diskSource, mem, mountWinDriver, name, tRegPwd, tRegUname } =
    vmData;
  if (bootFromCD) {
    cy.get(cView.bootFromCD).check();
    switch (cdSource.name) {
      case 'ISO':
      case 'Registry':
      case 'URL': {
        cy.get(cView.cdSourceDropDown).click();
        cy.get(cdSource.catalogSelector).click();
        cy.get(cdSource.catalogInput).wait(2000).type(cdSource.value, { delay: 100 });
        break;
      }
      case 'PVC': {
        cy.get(cView.cdSourceDropDown).click();
        cy.get(cdSource.catalogSelector).click();
        cy.contains(cdSource.selectPVCNS).click();
        cy.contains(
          'fieldset[aria-labelledby="cd-boot-source-pvc-select-project-select"] li',
          cdSource.pvcNS,
        ).click();
        cy.wait(3000);
        cy.contains(cdSource.selectPVCName).click();
        cy.contains('.pf-v6-c-select__menu-wrapper', cdSource.pvcName).click();
        break;
      }
      case 'Upload': {
        cy.get(cView.cdSourceDropDown).click();
        cy.contains(cView.cdSource.UploadBtnMenu, cView.cdSource.UploadBtnText).click();
        cy.dropFile(cdSource.value, cdSource.value.split('/').pop(), '.pf-v6-c-file-upload');
        break;
      }
      default: {
        break;
      }
    }
  }
  if (diskSource) {
    switch (diskSource.name) {
      case 'ISO':
      case 'Registry':
      case 'URL': {
        cy.get(cView.diskSourceDropDown).click();
        cy.wait(3000);
        cy.get(diskSource.catalogSelector).click();
        cy.wait(3000);
        cy.get(diskSource.catalogInput).wait(2000).focus().type(diskSource.value, { delay: 500 });
        if (tRegUname) {
          cy.get(diskSource.dsRegUname).type(tRegUname);
          cy.get(diskSource.dsRegPwd).type(tRegPwd);
        }
        break;
      }
      case 'clonePVC': {
        cy.get(cView.diskSourceDropDown).click();
        cy.wait(3000);
        cy.get(diskSource.catalogSelector).click();
        //cy.contains(diskSource.selectPVCNS).click();
        cy.contains('.pf-v6-c-menu-toggle__text', '--- Select PVC project ---').click();
        cy.contains('#select-inline-filter-listbox li', diskSource.pvcNS).click();
        // cy.byButtonText(diskSource.pvcNS).click();
        cy.wait(3000);
        //cy.contains(diskSource.selectPVCName).click();
        cy.contains('.pf-v6-c-menu-toggle__text', '--- Select PVC name ---').click();
        cy.contains('.pf-v6-c-menu__list-item', diskSource.pvcName).click();
        break;
      }
      case 'Upload': {
        cy.get(cView.diskSourceDropDown).click();
        cy.contains(cView.diskSource.UploadBtnMenu, cView.diskSource.UploadBtnText).click();
        cy.dropFile(diskSource.value, diskSource.value.split('/').pop(), '.pf-v6-c-file-upload');
        break;
      }
      default: {
        break;
      }
    }
  }
  if (mountWinDriver !== undefined && mountWinDriver === false) {
    cy.get(cView.winDrivers).uncheck();
  }
  cy.get(cView.vmName).clear().type(name);
  if (cpu) {
    cy.get(cView.editCPU).click();
    cy.get(cpuInput).clear().type(cpu);
    cy.clickSaveBtn();
  }
  if (mem) {
    cy.get(cView.editCPU).click();
    cy.get(memInput).clear().type(cpu);
    cy.clickSaveBtn();
  }
};

export const fillOverview = (vmData: VirtualMachineData) => {
  const { bootMode, cpu, description, gpu, headless, hostname, name, startInPause, workload } =
    vmData;
  cy.contains('h1', 'Customize and create VirtualMachine', { timeout: 180000 }).should('exist');
  if (name) {
    cy.get(cView.nameEditBtn).click();
    cy.get(cView.nameInput).clear().type(name);
    cy.clickSaveBtn();
  }
  if (description) {
    cy.get(cView.descEditBtn).click();
    cy.get(cView.descText).clear().type(description);
    cy.clickSaveBtn();
  }
  if (cpu) {
    cy.get(cView.cpuEditBtn).click();
    cy.get('input[name="cpu-input"]').clear().type('3');
    cy.get('input[name="memory-input"]').clear().type('3');
    cy.clickSaveBtn();
  }
  if (bootMode) {
    cy.get(cView.bootModeEditBtn).click();
    cy.get(cView.modalBox).find(cView.menuToggle).click();
    cy.contains('span.pf-v6-c-menu__item-text', bootMode).click();
    cy.clickSaveBtn();
  }
  if (workload) {
    cy.get(cView.workloadEditBtn).click();
    cy.get('div[id="tab-modal"]').find(cView.menuToggle).click();
    cy.contains(cView.menuItemMain, workload).click();
    cy.clickSaveBtn();
  }
  if (gpu) {
    cy.byButtonText('GPU devices').click();
    cy.byButtonText('Add GPU device').click();
    cy.get('button[aria-label="Options menu"]').click();
    cy.byButtonText('nvidia.com').click();
    cy.get('input#name').clear().type('vgpu_test');
    cy.get('button.pf-m-plain>svg[viewBox="0 0 512 512"]').click();
    cy.get(row).contains('vgpu_test').should('exist');
    cy.clickSaveBtn();
    cy.get('.hardware-devices-table').should('contain', 'vgpu_test');
  }
  if (startInPause) {
    cy.get(cView.startInPause).check();
  } else if (startInPause === false) {
    cy.get(cView.startInPause).uncheck();
  }
  if (hostname) {
    cy.get(cView.hostnameEditBtn).click();
    cy.get(cView.hostnameInput).type(hostname);
    cy.clickSaveBtn();
  }
  if (headless) {
    cy.get(cView.headlessMode).check();
  } else if (headless === false) {
    cy.get(cView.headlessMode).uncheck();
  }
};

export const fillEnvironment = (vmData: VirtualMachineData) => {
  const { addEnvDisk } = vmData;
  if (addEnvDisk) {
    tab.navigateToTEnvironment();
    cy.contains('Add Config Map, Secret or Service Account').click();
    cy.contains('Select a resource').click();
    cy.get('.pf-v6-c-select__menu-group').eq(0).find('ul>li').first().click();
    cy.contains('Add Config Map, Secret or Service Account').click();
    cy.contains('Select a resource').click();
    cy.get('.pf-v6-c-select__menu-group').eq(1).find('ul>li').first().click();
    cy.contains('Add Config Map, Secret or Service Account').click();
    cy.contains('Select a resource').click();
    cy.get('.pf-v6-c-select__menu-group').eq(2).find('ul>li').first().click();
    cy.clickSubmitBtn();
  }
};

export const fillScheduling = (vmData: VirtualMachineData) => {
  const { dedicatedResources, descheduler, evictionStrategy } = vmData;
  if (descheduler || dedicatedResources || evictionStrategy) {
    tab.navigateToTScheduling();
  }
  if (descheduler) {
    cy.get(cView.deschedulerEditBtn).click();
    cy.get(cView.deschedulerCheckBox).check();
    cy.clickSaveBtn();
  }
  if (dedicatedResources) {
    cy.get(cView.dedicatedResourceEditBtn).click();
    cy.get(cView.dedicatedResourceCheckBox).check();
    cy.clickSaveBtn();
  }
  if (evictionStrategy !== undefined && !evictionStrategy) {
    cy.get(cView.evictionStrategyEditBtn).click();
    cy.get(cView.evictionStrategyCheckBox).uncheck();
    cy.clickSaveBtn();
  }
};

// add nic with nad created in setup
export const addNetwork = (vmData: VirtualMachineData) => {
  if (vmData.nics) {
    tab.navigateToTNetworks();
    vmData.nics.forEach((nic) => {
      addNic(nic);
      cy.wait(3000);
    });
  }
};

export const addDisks = (vmData: VirtualMachineData) => {
  if (vmData.disks) {
    tab.navigateToTDisks();
    vmData.disks.forEach((disk) => {
      addDisk(disk);
      cy.wait(10000);
    });
  }
  if (vmData.storageClass) {
    tab.navigateToTDisks();
    getRow('rootdisk', () => cy.get('button[aria-label="Actions"]').click());
    cy.get('ul[aria-labelledby="toggle-id-disk"]').contains('Edit').click();
    cy.wait(3000);
    cy.get('[data-test-id="storage-class-select"]').click();
    cy.get(`[data-test-id="storage-class-${vmData.storageClass}"]`).click();
    cy.clickSaveBtn();
  }
};

export const fillMetadata = (vmData: VirtualMachineData) => {
  const { labels } = vmData;
  if (labels) {
    tab.navigateToTMetadata();
    cy.get(cView.labelsEditBtn).click();
    labels.forEach((label) => {
      cy.get(cView.labelsInput).type(`${label}{enter}`);
    });
    cy.clickSaveBtn();
  }
};

export const fillScripts = (vmData: VirtualMachineData) => {
  const {
    cloudInitPwd,
    cloudInitUname,
    ethName,
    existSecret,
    gateway,
    ipAddr,
    newSecret,
    sysprepFile,
    sysprepName,
  } = vmData;
  tab.navigateToTScripts();
  if (cloudInitUname || cloudInitPwd || ethName) {
    cy.contains(descrGroup, cloudInit).find('button').eq(0).click();
    // cy.get(cView.cloudInitEditBtn).click();
    if (cloudInitUname) {
      cy.get(cView.cloudInitUser).clear().type(cloudInitUname);
    }
    if (cloudInitPwd) {
      cy.get(cView.cloudInitPwd).clear().type(cloudInitPwd);
    }
    if (ethName) {
      // cy.contains(descrGroup, cloudInit).find('button').eq(0).click();
      // // cy.get(cView.cloudInitEditBtn).click();
      cy.get(cView.networkCheckbox).check();
      cy.get(cView.ethName).type(ethName);
      cy.get(cView.ipAddr).type(ipAddr);
      cy.get(cView.gateway).type(gateway);
    }
    cy.clickApplyBtn();
  }
  if (newSecret) {
    cy.contains(descrGroup, authSSHKey).find('button').click();
    // cy.get(cView.sshEditBtn).click();
    cy.get(cView.none).click();
    cy.get(cView.addNew).click();
    cy.dropFile('./fixtures/rsa.pub', 'rsa.pub', cView.uploadSecret);
    cy.wait(1000);
    cy.get(cView.secretName).type(newSecret);
    cy.clickSaveBtn();
    cy.contains('.co-resource-item__resource-name', newSecret).should('exist');
  }
  if (existSecret) {
    cy.contains(descrGroup, authSSHKey).find('button').click();
    // cy.get(cView.sshEditBtn).click();
    cy.get(iView.useExisting).click();
    cy.get('button[placeholder="Select secret"]').click();
    cy.get(`button#select-inline-filter-${existSecret}`).click();
    cy.clickSaveBtn();
    cy.contains('.co-resource-item__resource-name', existSecret).should('exist');
  }
  if (sysprepFile) {
    cy.contains(descrGroup, sysPrep).find('button').eq(0).click();
    // cy.get(vmView.vmSysprepEdit).click();
    cy.dropFile(sysprepFile, sysprepFile.split('/').pop(), vmView.autoUnInput);
    cy.dropFile(sysprepFile, sysprepFile.split('/').pop(), vmView.unattendInput);
    cy.clickSaveBtn();
    cy.get(vmView.vmSysprep).should('contain.text', 'Available');
  }
  if (sysprepName) {
    cy.contains(descrGroup, sysPrep).find('button').eq(0).click();
    // cy.get(vmView.vmSysprepEdit).click();
    cy.byButtonText('Attach existing sysprep').click();
    cy.byButtonText('--- Select sysprep ---').click();
    cy.byButtonText(`sysprep-${sysprepName}`).click();
    cy.clickSaveBtn();
    cy.get(vmView.vmSysprep).within(() => {
      cy.get(vmView.descrText).should('contain.text', 'Selected sysprep');
      cy.get(vmView.descrText).should('contain.text', `sysprep-${sysprepName}`);
    });
  }
};
