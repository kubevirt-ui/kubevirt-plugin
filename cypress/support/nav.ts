import './selectors';

import { catalogNav, overviewNav, resourceTitle, templateNav, vmNav } from '../views/selector';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      visitOverview(): void;
      visitCatalog(): void;
      visitVMs(): void;
      visitTemplates(): void;
    }
  }
}

Cypress.Commands.add('visitOverview', () => {
  cy.clickVirtLink(overviewNav);
  cy.contains(resourceTitle, 'Virtualization').should('be.visible');
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000);
});

Cypress.Commands.add('visitCatalog', () => {
  cy.clickVirtLink(catalogNav);
  cy.contains('Create VirtualMachine from catalog').should('be.visible');
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000);
});

Cypress.Commands.add('visitVMs', () => {
  cy.clickVirtLink(vmNav);
  cy.contains(resourceTitle, 'VirtualMachines').should('be.visible');
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000);
});

Cypress.Commands.add('visitTemplates', () => {
  cy.clickVirtLink(templateNav);
  cy.contains(resourceTitle, 'VirtualMachine Templates').should('be.visible');
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000);
});
