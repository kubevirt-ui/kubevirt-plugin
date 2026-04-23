import './selectors';

import { MINUTE, TEST_NS } from '../utils/const/index';
import * as nav from '../views/selector';
import { vmListTab } from '../views/selector-common';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      visitCatalog(): void;
      visitCatalogVirt(): void;
      visitCheckups(): void;
      visitCheckupsVirt(): void;
      visitITs(): void;
      visitITsVirt(): void;
      visitMPs(): void;
      visitMPsVirt(): void;
      visitNAD(): void;
      visitPreferences(): void;
      visitPreferencesVirt(): void;
      visitPVC(): void;
      visitSettings(): void;
      visitSettingsVirt(): void;
      visitStorageclass(): void;
      visitTemplates(): void;
      visitTemplatesVirt(): void;
      visitVMs(): void;
      visitVMsVirt(): void;
      visitVolumes(): void;
      visitVolumesVirt(): void;
    }
  }
}

Cypress.Commands.add('visitCatalog', () => {
  const nsPath = TEST_NS ? `ns/${TEST_NS}` : 'all-namespaces';
  cy.visit(`/k8s/${nsPath}/catalog`);
  cy.contains('Create new VirtualMachine', { timeout: 3 * MINUTE }).scrollIntoView();
});

Cypress.Commands.add('visitCatalogVirt', () => {
  const nsPath = TEST_NS ? `ns/${TEST_NS}` : 'all-namespaces';
  cy.visit(`/k8s/${nsPath}/catalog`);
  cy.contains('Select volume to boot from', { timeout: 3 * MINUTE }).should('be.visible');
});

Cypress.Commands.add('visitVMs', () => {
  cy.clickVirtLink(nav.vmNav);
  cy.byTestID(vmListTab).should('be.visible').closest('button').click();
  cy.byTestID(vmListTab).closest('button').should('have.attr', 'aria-selected', 'true');
  cy.get('.vm-listpagebody', { timeout: MINUTE }).should('be.visible');
});

Cypress.Commands.add('visitVMsVirt', () => {
  cy.get(nav.vmNav, { timeout: 5 * MINUTE }).click();
  cy.byTestID(vmListTab).should('be.visible').closest('button').click();
  cy.byTestID(vmListTab).closest('button').should('have.attr', 'aria-selected', 'true');
  cy.get('.vm-listpagebody', { timeout: MINUTE }).should('be.visible');
});

Cypress.Commands.add('visitNAD', () => {
  cy.get('[data-quickstart-id="qs-nav-networking"]', { timeout: MINUTE }).scrollIntoView();
  cy.contains('Networking').should('be.visible');
  cy.clickNavLink(['Networking', 'NetworkAttachmentDefinitions']);
  cy.contains('h1', 'NetworkAttachmentDefinitions', { timeout: MINUTE }).should('be.visible');
});

Cypress.Commands.add('visitTemplates', () => {
  cy.clickVirtLink(nav.templateNav);
});

Cypress.Commands.add('visitTemplatesVirt', () => {
  cy.get(nav.templateNav, { timeout: 5 * MINUTE }).click();
  cy.contains('h1', 'Templates', { timeout: MINUTE }).should('be.visible');
});

Cypress.Commands.add('visitITs', () => {
  cy.clickVirtLink(nav.itNav);
  cy.byLegacyTestID('cx1.2xlarge').should('exist');
});

Cypress.Commands.add('visitITsVirt', () => {
  cy.get(nav.itNav, { timeout: 5 * MINUTE }).click();
  cy.byLegacyTestID('cx1.2xlarge').should('exist');
});

Cypress.Commands.add('visitPreferences', () => {
  cy.clickVirtLink(nav.preferenceNav);
  cy.byLegacyTestID('fedora').should('exist');
});

Cypress.Commands.add('visitPreferencesVirt', () => {
  cy.get(nav.preferenceNav, { timeout: 5 * MINUTE }).click();
  cy.byLegacyTestID('alpine').should('exist');
});

Cypress.Commands.add('visitVolumes', () => {
  cy.clickVirtLink(nav.volumeNav);
});

Cypress.Commands.add('visitVolumesVirt', () => {
  cy.get(nav.volumeNav, { timeout: 5 * MINUTE }).click();
});

Cypress.Commands.add('visitMPs', () => {
  cy.clickVirtLink(nav.mpNav);
});

Cypress.Commands.add('visitMPsVirt', () => {
  cy.get(nav.mpNav, { timeout: 5 * MINUTE }).click();
});

Cypress.Commands.add('visitCheckups', () => {
  cy.clickVirtLink(nav.checkupNav);
});

Cypress.Commands.add('visitCheckupsVirt', () => {
  cy.get(nav.checkupNav, { timeout: 5 * MINUTE }).click();
});

Cypress.Commands.add('visitSettings', () => {
  cy.clickVirtLink(nav.settingsNav);
});

Cypress.Commands.add('visitSettingsVirt', () => {
  cy.get(nav.settingsNav, { timeout: 5 * MINUTE }).click();
});

Cypress.Commands.add('visitPVC', () => {
  cy.get('[data-quickstart-id="qs-nav-storage"]', { timeout: MINUTE }).scrollIntoView();
  cy.containsExactMatch('Storage').should('be.visible');
  cy.clickNavLink(['Storage', 'PersistentVolumeClaims']);
});

Cypress.Commands.add('visitStorageclass', () => {
  cy.get('[data-quickstart-id="qs-nav-storage"]', { timeout: MINUTE }).scrollIntoView();
  cy.containsExactMatch('Storage').should('be.visible');
  cy.clickNavLink(['Storage', 'StorageClasses']);
  cy.contains('h1', 'StorageClasses', { timeout: MINUTE }).should('be.visible');
});
