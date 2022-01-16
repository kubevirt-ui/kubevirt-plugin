/* eslint-disable cypress/require-data-selectors */
import './support/selectors';
import './support/login';

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      install(encrypted?: boolean): Chainable<Element>;
    }
  }
}

Cypress.on('uncaught:exception', () => {
  // don't fail on Cypress' internal errors.
  return false;
});

Cypress.Cookies.debug(true);

Cypress.Cookies.defaults({
  preserve: ['openshift-session-token', 'csrf-token'],
});

// Cypress.Commands.add('install', () => {
//   cy.exec(`oc get storagesystem ${STORAGE_SYSTEM_NAME} -n ${CLUSTER_NAMESPACE}`, {
//     failOnNonZeroExit: false,
//   }).then(({ code }) => {
//     if (code !== 0) {
//       cy.clickNavLink(['Operators', 'Installed Operators']);
//       cy.byLegacyTestID('item-filter').type('Openshift Data Foundation');
//       cy.byTestRows('resource-row').get('td').first().click();
//       cy.byLegacyTestID('horizontal-link-Storage System').click();
//       cy.byTestID('item-create').click();
//       // Wait for the StorageSystem page to load.
//       cy.contains('Create StorageSystem', { timeout: 10 * 1000 }).should('be.visible');
//       cy.get('button').contains('Next').click();
//       cy.get('input[type="checkbox"]').first().uncheck();
//       cy.get('input[type="checkbox"]').first().check();
//       cy.get('button').contains('Next').click();
//       cy.get('button').contains('Next').click();
//       cy.get('button').contains('Create StorageSystem').as('Create StorageSystem Button');
//       cy.get('@Create StorageSystem Button').click();
//       // Wait for the storage system to be created.
//       cy.get('@Create StorageSystem Button', { timeout: 10 * 1000 }).should('not.exist');
//       cy.log('Check if storage system was created');
//       cy.clickNavLink(['Operators', 'Installed Operators']);
//       cy.byLegacyTestID('item-filter').type('Openshift Data Foundation');
//       cy.byTestRows('resource-row').get('td').first().click();
//       cy.byLegacyTestID('horizontal-link-Storage System').click();
//       cy.byLegacyTestID('item-filter').type(`${STORAGE_SYSTEM_NAME}`);
//       cy.get('td[role="gridcell"]', { timeout: 5 * 60000 }).contains('Available');
//       cy.exec(OCS_SC_STATE, { timeout: 25 * 60000 });
//     } else {
//       cy.log(' ocs-storagecluster-storagesystem is present, proceeding without installation.');
//     }
//   });
// });
