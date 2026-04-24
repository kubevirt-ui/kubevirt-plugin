import './selectors';

import { MINUTE, TEST_NS } from '../utils/const/index';
import * as nav from '../views/selector';
import { vmListTab } from '../views/selector-common';

function ensureVirtNavVisible(selector: string) {
  cy.get(selector, { timeout: 5 * MINUTE }).then(($el) => {
    if (!$el.is(':visible')) {
      cy.get(nav.virtualizationNav).scrollIntoView().click();
    }
  });
  cy.get(selector, { timeout: MINUTE }).scrollIntoView().should('be.visible');
}

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
  cy.get('table.BootableVolumeList-table tbody tr', { timeout: 3 * MINUTE }).should(
    'have.length.at.least',
    1,
  );
});

Cypress.Commands.add('visitCatalogVirt', () => {
  const nsPath = TEST_NS ? `ns/${TEST_NS}` : 'all-namespaces';
  cy.visit(`/k8s/${nsPath}/catalog`);
  cy.contains('Select volume to boot from', { timeout: 3 * MINUTE }).should('be.visible');
  cy.get('table.BootableVolumeList-table tbody tr', { timeout: 3 * MINUTE }).should(
    'have.length.at.least',
    1,
  );
});

Cypress.Commands.add('visitVMs', () => {
  cy.clickVirtLink(nav.vmNav);
  cy.byTestID(vmListTab).should('be.visible').closest('button').click();
  cy.byTestID(vmListTab).closest('button').should('have.attr', 'aria-selected', 'true');
  cy.get('.vm-listpagebody', { timeout: MINUTE }).should('be.visible');
});

Cypress.Commands.add('visitVMsVirt', () => {
  ensureVirtNavVisible(nav.vmNav);
  cy.get(nav.vmNav).click();
  cy.byTestID(vmListTab).should('be.visible').closest('button').click();
  cy.byTestID(vmListTab).closest('button').should('have.attr', 'aria-selected', 'true');
  cy.get('.vm-listpagebody', { timeout: MINUTE }).should('be.visible');
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
  ensureVirtNavVisible(nav.templateNav);
  cy.get(nav.templateNav).click();
});

Cypress.Commands.add('visitITs', () => {
  cy.clickVirtLink(nav.itNav);
  cy.byLegacyTestID('cx1.2xlarge').should('exist');
});

Cypress.Commands.add('visitITsVirt', () => {
  ensureVirtNavVisible(nav.itNav);
  cy.get(nav.itNav).click();
  cy.byLegacyTestID('cx1.2xlarge').should('exist');
});

Cypress.Commands.add('visitPreferences', () => {
  cy.clickVirtLink(nav.preferenceNav);
  cy.byLegacyTestID('fedora').should('exist');
});

Cypress.Commands.add('visitPreferencesVirt', () => {
  ensureVirtNavVisible(nav.preferenceNav);
  cy.get(nav.preferenceNav).click();
  cy.byLegacyTestID('alpine').should('exist');
});

Cypress.Commands.add('visitVolumes', () => {
  cy.clickVirtLink(nav.volumeNav);
});

Cypress.Commands.add('visitVolumesVirt', () => {
  ensureVirtNavVisible(nav.volumeNav);
  cy.get(nav.volumeNav).click();
});

Cypress.Commands.add('visitMPs', () => {
  cy.clickVirtLink(nav.mpNav);
});

Cypress.Commands.add('visitMPsVirt', () => {
  ensureVirtNavVisible(nav.mpNav);
  cy.get(nav.mpNav).click();
});

Cypress.Commands.add('visitCheckups', () => {
  cy.clickVirtLink(nav.checkupNav);
});

Cypress.Commands.add('visitCheckupsVirt', () => {
  ensureVirtNavVisible(nav.checkupNav);
  cy.get(nav.checkupNav).click();
});

Cypress.Commands.add('visitSettings', () => {
  cy.clickVirtLink(nav.settingsNav);
});

Cypress.Commands.add('visitSettingsVirt', () => {
  ensureVirtNavVisible(nav.settingsNav);
  cy.get(nav.settingsNav).click();
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
});
