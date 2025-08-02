import { TEST_NS } from '../utils/const/index';
import { Perspective, switchPerspective, topology, tour } from '../views/perspective';

const KUBEADMIN_USERNAME = 'kubeadmin';
const KUBEADMIN_IDP = 'kube:admin';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      Login(): void;
      login(providerName?: string, username?: string, password?: string): Chainable<Element>;
      logout(): void;
    }
  }
}

Cypress.Commands.add('Login', () => {
  if (Cypress.env('NON_PRIV')) {
    cy.exec(`oc adm policy add-role-to-user admin test -n ${TEST_NS}`);
    cy.login('test', 'test', 'test');
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

Cypress.Commands.add('login', (provider: string, username: string, password: string) => {
  cy.visit(''); // visits baseUrl which is set in plugins.js
  cy.task('log', `  Logging in as ${username || KUBEADMIN_USERNAME}`);
  cy.get('.pf-v6-c-login__main', { timeout: 180000 }).should('exist');
  const idp = provider || KUBEADMIN_IDP;
  cy.get('body').then(($body) => {
    if ($body.text().includes(idp)) {
      cy.contains(idp).should('be.visible').click();
    }
  });
  cy.get('#inputUsername').type(username || KUBEADMIN_USERNAME);
  cy.get('#inputPassword').type(password || Cypress.env('BRIDGE_KUBEADMIN_PASSWORD'));
  cy.get('button[type=submit]').click();
  cy.wait(20000);
  cy.get('body').then(($body) => {
    if ($body.find(tour).length) {
      cy.get(tour).click();
    }
  });
  cy.byTestID(Cypress.env('BRIDGE_KUBEADMIN_PASSWORD') ? 'user-dropdown-toggle' : 'username', {
    timeout: 60000,
  }).should('be.visible');
  // wait for virtualization page appears, only for kubeadmin user
  if (idp === KUBEADMIN_IDP) {
    cy.contains('You are logged in as a temporary administrative user.').should('be.visible');
  }
  cy.task('log', '  Login is successful');
});

Cypress.Commands.add('logout', () => {
  cy.task('log', '  Logging out');
  cy.byTestID('user-dropdown').click();
  cy.byTestID('log-out').should('be.visible');
  // eslint-disable-next-line cypress/no-force
  cy.byTestID('log-out').click({ force: true });
  cy.wait(15000);
  cy.byLegacyTestID('login').should('be.visible');
});
