import { KUBEADMIN_IDP, KUBEADMIN_USERNAME } from '../utils/const/index';

import { masthead, submitButton } from './views';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(providerName?: string, username?: string, password?: string): Chainable<Element>;
      logout(): Chainable<Element>;
    }
  }
}

Cypress.Commands.add('login', (provider: string, username: string, password: string) => {
  // Check if auth is disabled (for a local development environment).
  cy.visit(''); // visits baseUrl which is set in plugins.js
  cy.window().then((win: any) => {
    if (win.SERVER_FLAGS?.authDisabled) {
      cy.task('log', '  skipping login, console is running with auth disabled');
      return;
    }
    // Make sure we clear the cookie in case a previous test failed to logout.
    cy.clearCookie('openshift-session-token');

    const idp = provider || KUBEADMIN_IDP;
    cy.task('log', `  Logging in as ${username || KUBEADMIN_USERNAME}`);
    cy.byLegacyTestID('login').should('be.visible');
    cy.get('body').then(($body) => {
      if ($body.text().includes(idp)) {
        cy.contains(idp).should('be.visible').click();
      }
    });
    cy.get('#inputUsername').type(username || KUBEADMIN_USERNAME);
    cy.get('#inputPassword').type(password || Cypress.env('BRIDGE_KUBEADMIN_PASSWORD'));
    cy.get(submitButton).click();
    masthead.username.shouldBeVisible();

    // wait for virtualization page
    cy.contains('.pf-c-nav__link', 'Virtualization').should('be.visible');
  });
});

Cypress.Commands.add('logout', () => {
  // Check if auth is disabled (for a local development environment).
  cy.window().then((win: any) => {
    if (win.SERVER_FLAGS?.authDisabled) {
      cy.task('log', '  skipping logout, console is running with auth disabled');
      return;
    }
    cy.task('log', '  Logging out');
    cy.byTestID('user-dropdown').click();
    cy.byTestID('log-out').should('be.visible');
    // eslint-disable-next-line cypress/no-force
    cy.byTestID('log-out').click({ force: true });
    cy.byLegacyTestID('login').should('be.visible');
  });
});
