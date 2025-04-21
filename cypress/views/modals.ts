import { Disk, NIC } from '../types/vm';
import { MINUTE } from '../utils/const/index';
import { addDiskTxt } from '../utils/const/string';

import { nameInput } from './actions';
import { menuItemText } from './selector-instance';
import { diskSelect } from './selector-template';
import { getRow } from './vm-flow';

export const uploadPVC = (name: string, image: string, size: string) => {
  cy.byTestID('item-create').click();
  cy.byLegacyTestID('dropdown-menu').contains('With Data upload form').click();
  cy.dropFile(image, image.split('/').pop(), '.pf-v6-c-file-upload');
  // cy.wait(5000);
  cy.get('#pvc-name', { timeout: MINUTE }).clear().type(name);
  cy.get('#request-size-input').clear().type(size);
  /* skip select sc, use the default for simplicity
   * it also remove flaky which observed in CI
  cy.get('[data-test="storage-class-dropdown"]').click();
  cy.get(`#${Cypress.env('STORAGE_CLASS')}-link`).click();
  cy.contains('[data-test="sp-default-settings"]', 'Access mode:').should('exist');
  */
  cy.get('#save-changes').click();
  cy.get('body').then(($body) => {
    if (!$body.text().includes(`"${name}" already exists`)) {
      cy.contains('Allocating Resources').should('exist');
      cy.contains('Uploading data', { timeout: MINUTE * 3 }).should('exist');
      cy.contains('.pf-v6-c-progress__measure', '100%', { timeout: MINUTE * 5 }).should('exist');
      // cy.wait(5000);
    }
  });
  cy.visitPVC();
  // cy.wait(5000);
  cy.get(`[data-test-id="${name}-scratch"]`, { timeout: MINUTE }).should('not.exist');
};

export const addDisk = (disk: Disk) => {
  const { diskSource, diskType, name, scsiReservation, shareDisk, size, storageClass, type } = disk;
  cy.byButtonText(addDiskTxt).click();
  cy.wait(3000);
  cy.contains(menuItemText, diskType).click();
  cy.get(nameInput, { timeout: MINUTE }).clear().type(name);
  // cy.wait(5000);
  switch (diskSource.name) {
    case 'DataSource':
    case 'Volume':
    case 'cloneVolume':
    case 'PVC': {
      if (diskSource.pvcNS) {
        cy.contains(diskSource.selectPVCNS).click();
        cy.get(`[data-test-id="${diskSource.pvcNS}"]`).click();
      }
      cy.wait(3000);
      cy.contains(diskSource.selectPVCName).click();
      cy.byButtonText(diskSource.pvcName).click();
      break;
    }
    case 'EphemeralDisk':
    case 'Registry': {
      cy.get(diskSource.input).type(diskSource.value);
      break;
    }
    case 'URL': {
      cy.get(diskSelect).click();
      cy.get(diskSource.selector).click();
      cy.get(diskSource.input).type(diskSource.value);
      break;
    }
    case 'Upload': {
      cy.get(diskSelect).click();
      cy.get(diskSource.selector).click();
      cy.wait(1000);
      cy.dropFile(diskSource.value, diskSource.value.split('/').pop(), diskSource.input);
      break;
    }
    default: {
      break;
    }
  }
  if (size) {
    cy.get('input[aria-label="Input"]').clear().type(size);
  }
  if (type) {
    cy.get('[data-test-id="disk-type-select"]').click();
    cy.get(`[data-test-id="disk-type-select-${type}"]`).click();
  }
  if (storageClass) {
    cy.get('[data-test-id="storage-class-select"]').click();
    cy.get(`[data-test-id="storage-class-${storageClass}"]`).click();
  }
  if (shareDisk) {
    cy.contains('Advanced settings').click();
    cy.get('input[id="sharable-disk"]').scrollIntoView().check();
  }
  if (scsiReservation) {
    cy.contains('Advanced settings').click();
    cy.get('input[id="lun-reservation"]').scrollIntoView().check();
  }
  cy.clickSaveBtn();
  cy.contains('h1', addDiskTxt, { timeout: MINUTE * 3 }).should('not.exist');
};

export const addNic = (nic: NIC) => {
  const { model, name, network, type } = nic;
  cy.byButtonText('Add network interface').click();
  cy.wait(3000);
  cy.get(nameInput, { timeout: MINUTE }).clear().type(name);
  if (model) {
    cy.get('[data-test-id="model-select"]').click();
    cy.get(`[data-test-id="model-select-${model}"]`).click();
  }
  if (network) {
    cy.get('[data-test-id="network-attachment-definition-select"]')
      .find('button.pf-v6-c-menu-toggle__button')
      .click();
    cy.byButtonText(network).click();
  }
  // use default nad and default type
  if (type) {
    cy.get('[data-test-id="network-interface-type-select"]').click();
    cy.get(`button[data-test-id="network-interface-type-select-${type}"]`).click();
  }
  cy.clickSaveBtn();
  cy.wait(3000);
};

export const deleteRow = (name: string) => {
  getRow(name, () => cy.get('button[aria-label="Actions"]').click());
  cy.get('[data-ouia-component-type="PF4/DropdownItem"]').eq(1).click();
  cy.get('.pf-v6-c-button.pf-m-danger.pf-m-progress').click();
  cy.wait(1000);
};
