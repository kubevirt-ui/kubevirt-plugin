import { nadData } from '../types/nad';

import { actionsBtn, row } from './selector-common';

export const name = 'input[name="name"]';
export const description = 'input[name="description"]';
export const type = '#toggle-nads-network-type';
export const cnvBridgeLink = '[data-test-dropdown-menu="cnv-bridge"]';
export const ovnNetwork = 'button[id="ovn-k8s-cni-overlay-link"]';
export const localnet = 'button[id="ovn-k8s-cni-overlay-localnet-link"]';
export const bridgeName = 'input[name="bridge.bridge"]';
export const bridgeMap = 'input[name="ovn-k8s-cni-overlay-localnet.bridgeMapping"]';
export const bridgeMTU = 'input[name="ovn-k8s-cni-overlay-localnet.mtu"]';
export const kebabBtn = '[data-test-id="kebab-button"]';
export const deleteAction = '[data-test-action=" Network Attachment Definition"]';
export const confirmBtn = '[data-test="confirm-action"]';
export const heading = '[data-test-section-heading="NetworkAttachmentDefinition details"]';
export const createBtn = '#save-changes';
export const macSpoofCHK = 'input[id="bridge.macspoofchk"]';
export const ovnSubnet = 'input[name="ovn-k8s-cni-overlay.subnets"]';
export const localnetSubnet = 'input[name="ovn-k8s-cni-overlay-localnet.subnets"]';
export const exclude = 'input[name="ovn-k8s-cni-overlay-localnet.excludeSubnets"]';

export const createNAD = (nad: nadData) => {
  cy.visitNAD();
  cy.byButtonText('Create').click();
  cy.get(name).clear().type(nad.name);
  cy.get(description).type(nad.description);
  cy.get(type).click();
  switch (nad.type) {
    case 'Bridge': {
      cy.byButtonText('Linux bridge').click();
      cy.get(bridgeName).clear().type(nad.bridge);
      if (!nad.macSpoof) {
        cy.get(macSpoofCHK).uncheck(); // default is on, only click this when the value is false
      }
      break;
    }
    case 'OVN': {
      cy.byButtonText('L2 overlay').click();
      if (nad.subnet) {
        cy.get(ovnSubnet).type(nad.subnet);
      }
      break;
    }
    case 'Localnet': {
      cy.byButtonText('secondary localnet').click();
      cy.get(bridgeMap).clear().type(nad.bridge);
      cy.get(bridgeMTU).clear().type(nad.mtu);
      if (nad.subnet) {
        cy.get(localnetSubnet).type(nad.subnet);
        cy.get(exclude).type(nad.exclude);
      }
      break;
    }
  }
  cy.get(createBtn).click();
  cy.get(heading).should('exist');
};

// delete nad on list page
export const deleteNAD = (nad: nadData) => {
  cy.contains(row, nad.name).find(actionsBtn).click();
  cy.byButtonText('Delete').click();
  cy.get(confirmBtn).click();
  cy.contains(row, nad.name).should('not.exist');
};
