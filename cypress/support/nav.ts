import './selectors';

import { MINUTE } from '../utils/const/index';
import * as nav from '../views/selector';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      visitCatalogAdm(): void;
      visitCatalogVirt(): void;
      visitCheckups(): void;
      visitITs(): void;
      visitMPs(): void;
      visitOverviewAdm(): void;
      visitOverviewVirt(): void;
      visitPreferences(): void;
      visitTemplates(): void;
      visitVMs(): void;
      visitVolumes(): void;
    }
  }
}

Cypress.Commands.add('visitOverviewAdm', () => {
  cy.clickVirtLink(nav.overviewNav);
  cy.contains(nav.resourceTitle, 'Virtualization', { timeout: 3 * MINUTE }).should('be.visible');
});

Cypress.Commands.add('visitOverviewVirt', () => {
  cy.get(nav.overviewNav, { timeout: 3 * MINUTE }).click();
  cy.contains(nav.resourceTitle, 'Virtualization', { timeout: 3 * MINUTE }).should('be.visible');
});

Cypress.Commands.add('visitCatalogAdm', () => {
  cy.clickVirtLink(nav.catalogNav);
  cy.contains('Create new VirtualMachine', { timeout: 3 * MINUTE }).should('be.visible');
});

Cypress.Commands.add('visitCatalogVirt', () => {
  cy.get(nav.catalogNav, { timeout: 3 * MINUTE }).click();
  cy.contains('Select volume to boot from', { timeout: 3 * MINUTE }).should('be.visible');
});

Cypress.Commands.add('visitVMs', () => {
  cy.clickVirtLink(nav.vmNav);
  cy.contains(nav.resourceTitle, 'VirtualMachines', { timeout: 3 * MINUTE }).should('be.visible');
});

Cypress.Commands.add('visitTemplates', () => {
  cy.clickVirtLink(nav.templateNav);
  cy.contains(nav.resourceTitle, 'VirtualMachine Templates', { timeout: 3 * MINUTE }).should(
    'be.visible',
  );
});

Cypress.Commands.add('visitITs', () => {
  cy.clickVirtLink(nav.itNav);
  cy.byLegacyTestID('cx1.2xlarge').should('exist');
});

Cypress.Commands.add('visitPreferences', () => {
  cy.clickVirtLink(nav.preferenceNav);
  cy.byLegacyTestID('fedora').should('exist');
});

Cypress.Commands.add('visitVolumes', () => {
  cy.clickVirtLink(nav.volumeNav);
  cy.contains(nav.resourceTitle, 'Bootable volumes', { timeout: 3 * MINUTE }).should('be.visible');
});

Cypress.Commands.add('visitMPs', () => {
  cy.clickVirtLink(nav.mpNav);
  cy.contains(nav.resourceTitle, 'MigrationPolicies', { timeout: 3 * MINUTE }).should('be.visible');
});

Cypress.Commands.add('visitCheckups', () => {
  cy.clickVirtLink(nav.checkupNav);
  cy.contains(nav.resourceTitle, 'Checkups', { timeout: 3 * MINUTE }).should('be.visible');
});
