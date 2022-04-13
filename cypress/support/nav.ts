import './selectors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      visitCatalog(): void;
      visitVMs(): void;
    }
  }
}

Cypress.Commands.add('visitCatalog', () => {
  cy.clickNavLink(['Virtualization', 'Catalog']);
});

Cypress.Commands.add('visitVMs', () => {
  cy.clickNavLink(['Virtualization', 'VirtualMachines']);
});
