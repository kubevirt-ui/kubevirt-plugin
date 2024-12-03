import './selectors';

import * as nav from '../views/selector';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      visitCatalog(): void;
      visitCheckups(): void;
      visitITs(): void;
      visitMPs(): void;
      visitOverview(): void;
      visitPreferences(): void;
      visitTemplates(): void;
      visitVMs(): void;
      visitVolumes(): void;
    }
  }
}

Cypress.Commands.add('visitOverview', () => {
  cy.clickVirtLink(nav.overviewNav);
  cy.contains(nav.resourceTitle, 'Virtualization').should('be.visible');
});

Cypress.Commands.add('visitCatalog', () => {
  cy.clickVirtLink(nav.catalogNav);
  cy.contains('Create new VirtualMachine').should('be.visible');
});

Cypress.Commands.add('visitVMs', () => {
  cy.clickVirtLink(nav.vmNav);
  cy.contains(nav.resourceTitle, 'VirtualMachines').should('be.visible');
});

Cypress.Commands.add('visitTemplates', () => {
  cy.clickVirtLink(nav.templateNav);
  cy.contains(nav.resourceTitle, 'VirtualMachine Templates').should('be.visible');
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
  cy.contains(nav.resourceTitle, 'Bootable volumes').should('be.visible');
});

Cypress.Commands.add('visitMPs', () => {
  cy.clickVirtLink(nav.mpNav);
  cy.contains(nav.resourceTitle, 'MigrationPolicies').should('be.visible');
});

Cypress.Commands.add('visitCheckups', () => {
  cy.clickVirtLink(nav.checkupNav);
  cy.contains(nav.resourceTitle, 'Checkups').should('be.visible');
});
