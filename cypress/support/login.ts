import { MINUTE, TEST_NS } from '../utils/const/index';
import { Perspective, switchPerspective, topology, tour } from '../views/perspective';
import { submitButton } from '../views/selector-common';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      Login(): void;
      login(providerName?: string, username?: string, password?: string): Chainable<Element>;
      logout(): Chainable<Element>;
    }
  }
}

const KUBEADMIN_USERNAME = 'kubeadmin';
const KUBEADMIN_IDP = 'kube:admin';

Cypress.Commands.add(
  'login',
  (
    provider: string = KUBEADMIN_IDP,
    username: string = KUBEADMIN_USERNAME,
    password: string = Cypress.env('BRIDGE_KUBEADMIN_PASSWORD'),
  ) => {
    // Constants for selectors
    const SELECTORS = {
      loginButton: '[data-test-id=login], [data-test=login]',
      passwordInput: '#inputPassword',
      submitButton: 'button[type=submit]',
      tourPopup: '[data-test="tour-step-footer-secondary"]',
      userDropdown: '[data-test="user-dropdown-toggle"]',
      usernameInput: '#inputUsername',
    };

    // Visit the base URL and check auth status
    cy.visit('/');
    cy.window().then((win: any) => {
      if (win.SERVER_FLAGS?.authDisabled) {
        cy.log('Skipping login - console is running with auth disabled');
        return;
      }

      // Clear session token
      cy.clearCookie('openshift-session-token');

      // Login flow
      cy.get(SELECTORS.loginButton, { timeout: 300000 }).should('be.visible');

      // Handle IDP selection if present
      const idp = provider || KUBEADMIN_IDP;
      cy.get('body').then(($body) => {
        if ($body.text().includes(idp)) {
          cy.contains(idp).should('be.visible').click();
        }
      });

      // Fill and submit credentials
      cy.get(SELECTORS.usernameInput).type(username);
      cy.get(SELECTORS.passwordInput).type(password, { log: false }); // Hide password in logs
      cy.get(SELECTORS.submitButton).click();

      cy.wait(20000);

      // Close tour popup if present
      cy.get('body').then(($body) => {
        if ($body.find(SELECTORS.tourPopup).length) {
          cy.get(SELECTORS.tourPopup).click();
        }
      });

      cy.get(SELECTORS.userDropdown, { timeout: 300000 }).should('be.visible');

      // Verify login via CLI
      cy.exec('oc whoami').then((result) => {
        cy.log(`Logged in as: ${result.stdout.trim()}`);
      });
    });
  },
);

Cypress.Commands.add('Login', () => {
  if (Cypress.env('NON_PRIV')) {
    cy.exec(`oc adm policy add-role-to-user admin test -n ${TEST_NS}`);
    cy.login(
      Cypress.env('NON_PRIV_IDP'),
      Cypress.env('NON_PRIV_USER'),
      Cypress.env('NON_PRIV_PASSWD'),
    );
    // skip tour
    cy.get('body').then(($body) => {
      if ($body.find(tour).length) {
        cy.get(tour).click();
      }
      if ($body.find(topology).length) {
        switchPerspective(Perspective.Administrator);
      }
    });
  } else {
    cy.login();
  }
});

Cypress.Commands.add('logout', () => {
  // Check if auth is disabled (for a local development environment).
  cy.window().then((win) => {
    if (win.SERVER_FLAGS.authDisabled) {
      cy.task('log', '  skipping logout, console is running with auth disabled');
      return;
    }
    cy.task('log', '  Logging out');
    cy.byTestID('user-dropdown').click();
    cy.byTestID('log-out').should('be.visible');
    // eslint-disable-next-line cypress/no-force
    cy.byTestID('log-out').click();
    cy.byLegacyTestID('login').should('be.visible');
  });
});
