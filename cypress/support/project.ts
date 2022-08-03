import { TEST_NS } from '../utils/const/index';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      selectProject(name: string): void;
      newProject(name: string): void;
      selectTestProject(): void;
      switchProject(name: string): void;
    }
  }
}

Cypress.Commands.add('selectProject', (name: string) => {
  cy.visit(`/k8s/cluster/projects`);
  cy.contains(name).should('be.visible');
  cy.byLegacyTestID(name).click();
});

Cypress.Commands.add('newProject', (project: string) => {
  cy.exec(`oc get ns ${project} > /dev/null 2>&1 || oc new-project ${project}`);
  if (Cypress.env('NON_PRIV')) {
    cy.exec(`oc adm policy add-role-to-user admin test -n ${project}`);
  }
});

Cypress.Commands.add('selectTestProject', () => {
  cy.selectProject(TEST_NS);
});

Cypress.Commands.add('switchProject', (projectName: string) => {
  cy.byLegacyTestID('namespace-bar-dropdown').contains('Project:').click();
  cy.byTestID('showSystemSwitch').check();
  cy.byTestID('dropdown-menu-item-link').contains(projectName).click();
});
