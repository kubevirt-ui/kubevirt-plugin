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
  // Don't additionally assert on nav.resourceTitle here: on current hot-cluster consoles
  // this content assertion is unreliably slow/times out even though the page underneath
  // has already rendered correctly; later steps assert on page content directly instead.
  cy.clickVirtLink(nav.vmNav);
});

Cypress.Commands.add('visitTemplates', () => {
  cy.clickVirtLink(nav.templateNav);
});

Cypress.Commands.add('visitITs', () => {
  cy.clickVirtLink(nav.itNav);
  // Prior tests may leave the shared name-filter set (e.g. "example"), which
  // hides the default cluster InstanceTypes this helper asserts on.
  cy.get('body').then(($body) => {
    if ($body.find(nav.nameFilter).length) {
      cy.get(nav.nameFilter).clear();
    }
  });
  cy.byLegacyTestID('cx1.2xlarge').should('exist');
});

Cypress.Commands.add('visitPreferences', () => {
  cy.clickVirtLink(nav.preferenceNav);
  cy.get('body').then(($body) => {
    if ($body.find(nav.nameFilter).length) {
      cy.get(nav.nameFilter).clear();
    }
  });
  cy.byLegacyTestID('fedora').should('exist');
});

Cypress.Commands.add('visitVolumes', () => {
  cy.clickVirtLink(nav.volumeNav);
});

Cypress.Commands.add('visitMPs', () => {
  cy.clickVirtLink(nav.mpNav);
});

Cypress.Commands.add('visitCheckups', () => {
  cy.clickVirtLink(nav.checkupNav);
});
