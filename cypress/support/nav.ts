import './selectors';

import { MINUTE } from '../utils/const/index';
import * as nav from '../views/selector';

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
      visitOverview(): void;
      visitOverviewVirt(): void;
      visitPreferences(): void;
      visitPreferencesVirt(): void;
      visitTemplates(): void;
      visitTemplatesVirt(): void;
      visitVMs(): void;
      visitVMsVirt(): void;
      visitVolumes(): void;
      visitVolumesVirt(): void;
    }
  }
}

Cypress.Commands.add('visitOverview', () => {
  cy.clickVirtLink(nav.overviewNav);
});

Cypress.Commands.add('visitOverviewVirt', () => {
  cy.get(nav.overviewNav, { timeout: 5 * MINUTE }).click();
});

Cypress.Commands.add('visitCatalog', () => {
  cy.clickVirtLink(nav.catalogNav);
  cy.contains('Create new VirtualMachine', { timeout: 3 * MINUTE }).scrollIntoView();
});

Cypress.Commands.add('visitCatalogVirt', () => {
  cy.get(nav.catalogNav, { timeout: 5 * MINUTE }).click();
  cy.contains('Select volume to boot from', { timeout: 3 * MINUTE }).should('be.visible');
});

Cypress.Commands.add('visitVMs', () => {
  cy.clickVirtLink(nav.vmNav);
});

Cypress.Commands.add('visitVMsVirt', () => {
  cy.get(nav.vmNav, { timeout: 5 * MINUTE }).click();
});

Cypress.Commands.add('visitNAD', () => {
  cy.get('[data-quickstart-id="qs-nav-networking"]', { timeout: MINUTE }).scrollIntoView();
  cy.contains('Networking').should('be.visible');
  cy.clickNavLink(['Networking', 'NetworkAttachmentDefinitions']);
  cy.byButtonText('Create').should('be.visible');
});

Cypress.Commands.add('visitTemplates', () => {
  cy.clickVirtLink(nav.templateNav);
});

Cypress.Commands.add('visitTemplatesVirt', () => {
  cy.get(nav.templateNav, { timeout: 5 * MINUTE }).click();
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
