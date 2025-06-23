import { VirtualMachineData } from '../types/vm';
import { volData } from '../types/vol';
import * as index from '../utils/const/index';
import { authSSHKey } from '../utils/const/string';

import { getRow } from './actions';
import { addDisk, addNic } from './modals';
import * as cView from './selector-catalog';
import * as vmView from './selector-common';
import * as iView from './selector-instance';

export const addVolume = (vol: volData) => {
  const {
    instanceType,
    iso,
    name,
    preference,
    project,
    pvcName,
    registryURL,
    sourceType,
    uploadImage,
    volName,
  } = vol;
  cy.wait(3000); // give seconds to wait for modal loaded
  switch (sourceType) {
    case 'Upload': {
      cy.dropFile(uploadImage, uploadImage.split('/').pop(), iView.upload);
      if (iso) {
        cy.get('input[id="iso-checkbox"]').check();
      }
      break;
    }
    case 'Volume': {
      cy.contains(iView.toggleText, 'Volume').click();
      cy.get('.pf-v6-c-menu__list-item').eq(1).click();
      cy.contains('.pf-v6-c-menu-toggle__text', '--- Select Volume project ---').click();
      cy.get(`[data-test-id="select-option-${project}"]`).click();
      cy.contains('.pf-v6-c-menu-toggle__text', '--- Select Volume name ---').click();
      cy.get(`[data-test-id="${pvcName}"]`).click();
      break;
    }
    case 'Volume snapshot': {
      cy.contains(iView.toggleText, 'Volume').click();
      cy.contains(iView.menuItemText, 'Volume snapshot').click();
      cy.get('button[placeholder="--- Select VolumeSnapshot project ---"]').click();
      cy.get('input[placeholder="--- Select VolumeSnapshot project ---"]').type('os-images');
      cy.byLegacyTestID(index.OS_IMAGES_NS).click();
      cy.wait(2000);
      cy.contains(iView.toggleText, '--- Select VolumeSnapshot name ---').click();
      cy.byButtonText(volName).click();
      break;
    }
    case 'Registry': {
      cy.contains(iView.toggleText, 'Volume').click();
      cy.contains(iView.menuItemText, 'Registry').click();
      cy.get(iView.registryURL)
        .type(registryURL, { delay: 1000 })
        .should('have.value', registryURL);
      cy.get(iView.cronExp).type('0 0 * * 2');
      break;
    }
  }
  cy.wait(2000); // give a bit more time for volume present in the modal
  cy.get(iView.volumeName).type(name);
  // select preference
  cy.contains(iView.toggleText, iView.selectPreferenceText).click();
  cy.get(iView.searchPreference).type(preference);
  cy.get(iView.preferenceValue(preference)).click();
  // select instanceType
  cy.contains(iView.toggleText, iView.selectInstanceText).click();
  cy.contains(iView.menuItemText, 'Red Hat provided').click();
  cy.contains(iView.menuItemText, 'U series').click();
  if (instanceType) {
    cy.contains(iView.menuItemText, instanceType).click();
  } else {
    cy.contains(iView.menuItemText, 'nano:').click();
  }
  cy.get(iView.description).scrollIntoView().type(`Test volume from ${sourceType}`); // file description
  cy.clickSaveBtn();
  cy.wait(60000);
  cy.contains(iView.modalTitle, iView.modalTitleText).should('not.exist');
};

export const delVolume = (name: string) => {
  getRow(name, () => cy.get(iView.delBtn).click());
  cy.contains(iView.menuItemText, 'Delete').click();
  cy.get('body').then(($body) => {
    if ($body.find(iView.pvcCheckbox).length) {
      cy.get(iView.pvcCheckbox).check();
    }
  });
  cy.byButtonText('Delete').click();
};

export const fillInstanceType = (vmData: VirtualMachineData) => {
  const {
    applyKey,
    bootDiskSize,
    existSecret,
    folder,
    iType,
    name,
    newSecret,
    newSecretName,
    secretProject,
    volume,
  } = vmData;
  cy.contains(iView.volName, volume).click();
  if (newSecret !== undefined) {
    cy.contains(index.TEST_SECRET_NAME).click();
    cy.get(iView.addNew).click();
    cy.dropFile('./fixtures/rsa.pub', 'rsa.pub', iView.fileDrop);
    cy.get(iView.secretName).type(newSecret);
    if (applyKey) {
      cy.get('input[id="apply-key-to-project-per-user"]').check();
    }
    cy.clickSaveBtn();
    cy.contains(newSecret).should('exist');
  }
  if (existSecret !== undefined) {
    cy.contains(index.TEST_SECRET_NAME).click();
    cy.get(iView.useExisting).click();
    if (secretProject !== undefined) {
      cy.get('button[placeholder="Select project"]').click();
      cy.get(`[data-test-id="select-option-${secretProject}"]`).click();
      cy.get('button[placeholder="Select secret"]').click();
      cy.contains(iView.menuItemText, existSecret).click();
      cy.get('input[id="new-secret-name"]').clear().type(newSecretName);
    } else {
      cy.get('button[placeholder="Select secret"]').click();
      cy.contains(iView.menuItemText, existSecret).click();
    }
    if (applyKey) {
      cy.get('input[id="apply-key-to-project-per-user"]').check();
    }
    cy.clickSaveBtn();
    cy.contains(newSecretName).should('exist');
  }
  cy.get(iView.vmName).clear().type(name);
  if (folder) {
    cy.get(iView.vmDetails).within(() => {
      cy.get(iView.vmFolder).type(folder);
    });
    cy.get(iView.vmFolderMenu).find('button').eq(0).click();
  }
  if (bootDiskSize) {
    cy.get('div.pf-v6-c-form__group.disk-source-form-group')
      .find('input[aria-label="Input"]')
      .clear()
      .type(bootDiskSize);
  }
};

export const fillDetails = (vmData: VirtualMachineData) => {
  const { bootMode, description, guestlog, headless, hostname, startInPause } = vmData;
  if (description) {
    cy.get(`[data-test-id="${vmData.name}-description"]`).find('svg').click();
    cy.get('[aria-label="description text area"]').type(description);
    cy.clickSaveBtn();
  }
  if (hostname) {
    cy.get(`[data-test-id="${vmData.name}-hostname"]`).find('svg').click();
    cy.get('input[id="hostname"]').type(hostname);
    cy.clickSaveBtn();
  }
  if (bootMode) {
    cy.byButtonText('Boot management').then(($el) => {
      if ($el.attr('aria-expanded') == 'false') {
        $el.click();
      }
    });
    cy.get(`[data-test-id="${vmData.name}-boot-method"]`).find('svg').click();
    cy.get('div.pf-v6-c-modal-box__body').find('span.pf-v6-c-menu-toggle__toggle-icon').click();
    cy.contains(iView.menuItemText, bootMode).click();
    cy.clickSaveBtn();
  }
  if (startInPause) {
    cy.byButtonText('Boot management').then(($el) => {
      if ($el.attr('aria-expanded') == 'false') {
        $el.click();
      }
    });
    cy.get('[data-test-id="start-pause-mode"]').find('input[type="checkbox"]').check();
  }
  if (headless) {
    cy.get(`[data-test-id="${vmData.name}-headless"]`).find('input[type="checkbox"]').check();
  }
  if (guestlog) {
    cy.get('[data-test-id="guest-system-log-access"]').find('input[type="checkbox"]').check();
  }
};

export const fillEnvironment = (vmData: VirtualMachineData) => {
  const { addEnvDisk } = vmData;
  if (addEnvDisk) {
    cy.contains('.pf-v6-c-tabs__item-text', 'Storage').click();
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
  const { dedicatedResources, descheduler, evictionStrategy, nodeSelector } = vmData;
  if (nodeSelector || descheduler || dedicatedResources || evictionStrategy !== undefined) {
    cy.contains('.pf-v6-c-tabs__item-text', 'Scheduling').click();
  }
  if (nodeSelector) {
    cy.get('button[data-test-id="node-selector"]').click();
    cy.get('[id="vm-labels-list-add-btn"]').click();
    cy.get('input[aria-label="selector key"]').type(nodeSelector.key);
    cy.get('input[aria-label="selector value"]').type(nodeSelector.value);
    cy.clickSaveBtn();
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
    cy.get('button[data-test-id="eviction-strategy"]').click();
    cy.wait(1000);
    cy.get('input[id="eviction-strategy"]').uncheck();
    cy.clickSaveBtn();
  }
};

// add nic with nad created in setup
export const addNics = (vmData: VirtualMachineData) => {
  if (vmData.nics) {
    cy.contains('.pf-v6-c-tabs__item-text', 'Network').click();
    cy.wait(3000);
    vmData.nics.forEach((nic) => {
      addNic(nic);
      cy.wait(3000);
    });
  }
};

export const addDisks = (vmData: VirtualMachineData) => {
  if (vmData.disks) {
    cy.contains('.pf-v6-c-tabs__item-text', 'Storage').click();
    cy.wait(5000); // wait for page loading
    vmData.disks.forEach((disk) => {
      addDisk(disk);
      cy.wait(10000);
    });
  }
  if (vmData.storageClass) {
    cy.contains('.pf-v6-c-tabs__item-text', 'Storage').click();
    getRow('rootdisk', () => cy.get('button[aria-label="Actions"]').click());
    cy.get('ul[aria-labelledby="toggle-id-disk"]').contains('Edit').click();
    cy.wait(3000);
    cy.get('[data-test-id="storage-class-select"]').click();
    cy.get(`[data-test-id="storage-class-${vmData.storageClass}"]`).click();
    cy.clickSaveBtn();
  }
};

export const fillMetadata = (vmData: VirtualMachineData) => {
  const { annotations, labels } = vmData;
  if (labels) {
    cy.contains('.pf-v6-c-tabs__item-text', 'Metadata').click();
    cy.get(`[data-test-id="${vmData.name}-labels-edit"]`).click();
    labels.forEach((label) => {
      cy.get('input[data-test="tags-input"]').type(`${label}{enter}`);
    });
    cy.clickSaveBtn();
  }
  if (annotations) {
    cy.contains('.pf-v6-c-tabs__item-text', 'Metadata').click();
    cy.get('svg.pf-v6-svg.co-icon-space-l').eq(1).click();
    // there is no good selector for annotion, just type one and use eq(1).
    annotations.forEach((anno) => {
      cy.contains('Add more').click();
      cy.get('input[aria-label="annotation key"]').eq(1).type(anno.key);
      cy.get('input[aria-label="annotation value"]').eq(1).type(anno.value);
    });
    cy.clickSaveBtn();
  }
};

export const fillSSH = (vmData: VirtualMachineData) => {
  const { existSecret, newSecret } = vmData;
  if (newSecret) {
    cy.contains('.pf-v6-c-tabs__item-text', 'SSH').click();
    cy.get('button[data-test-id="public-ssh-key-edit"]').click();
    cy.get(cView.none).click();
    cy.get(cView.addNew).click();
    cy.dropFile('./fixtures/rsa.pub', 'rsa.pub', cView.uploadSecret);
    cy.wait(1000);
    cy.get(cView.secretName).type(newSecret);
    cy.clickSaveBtn();
    cy.wait(2000);
    cy.contains(authSSHKey).click();
    cy.contains('.co-resource-item__resource-name', newSecret).should('exist');
  }
  if (existSecret) {
    cy.contains('.pf-v6-c-tabs__item-text', 'SSH').click();
    cy.get('[data-test-id="ssh-tab-edit-authorized"]').click();
    cy.get(iView.useExisting).click();
    cy.get('button[placeholder="Select secret"]').click();
    cy.contains(existSecret).click();
    cy.clickSaveBtn();
    cy.wait(2000);
    cy.contains(authSSHKey).click();
    cy.contains('.co-resource-item__resource-name', newSecret).should('exist');
  }
};

export const fillInitialRun = (vmData: VirtualMachineData) => {
  const { cloudInitPwd, cloudInitUname, ethName, gateway, ipAddr, sysprepFile, sysprepName } =
    vmData;
  if (cloudInitUname || cloudInitPwd || ethName) {
    cy.contains('.pf-v6-c-tabs__item-text', 'Initial run').click();
    cy.get('[data-test-id="undefined-edit"]').click();
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
  if (sysprepFile) {
    cy.contains('.pf-v6-c-tabs__item-text', 'Initial run').click();
    cy.get('[data-test-id="sysprep-button-edit"]').click();
    cy.dropFile(sysprepFile, sysprepFile.split('/').pop(), vmView.autoUnInput);
    cy.dropFile(sysprepFile, sysprepFile.split('/').pop(), vmView.unattendInput);
    cy.clickSaveBtn();
    cy.get(vmView.vmSysprep).should('contain.text', 'Available');
  }
  if (sysprepName) {
    cy.contains('.pf-v6-c-tabs__item-text', 'Initial run').click();
    cy.get('[data-test-id="sysprep-button-edit"]').click();
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

export const customizeIT = (vmData: VirtualMachineData) => {
  cy.contains(iView.volName, vmData.volume).click();
  cy.get(iView.vmName).clear().type(vmData.name);
  cy.byButtonText('Customize VirtualMachine').click();
  fillDetails(vmData);
  addDisks(vmData);
  addNics(vmData);
  fillEnvironment(vmData);
  fillScheduling(vmData);
  fillSSH(vmData);
  fillInitialRun(vmData);
  fillMetadata(vmData);
};
