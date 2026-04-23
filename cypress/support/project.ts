import {
  ALL_NAMESPACES_KEY,
  ALL_PROJ_NS,
  SINGLE_CLUSTER_KEY,
  TEST_NS,
  TREEVIEW_ROOT_ID,
} from '../utils/const/index';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      newProject(name: string): void;
      selectProject(name: string): void;
      selectTestProject(): void;
      switchProject(name: string): void;
      switchProjectUsingTreeView(projectName: string): void;
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

Cypress.Commands.add('switchProjectUsingTreeView', (projectName: string) => {
  if (projectName === ALL_PROJ_NS) {
    cy.get(`li[id="${ALL_NAMESPACES_KEY}"]`).click();
  } else {
    cy.get(`li[id="projectSelector/${SINGLE_CLUSTER_KEY}/${projectName}"]`).click();
  }
});

Cypress.Commands.add('switchProject', (projectName: string) => {
  if (projectName == null || (typeof projectName === 'string' && !projectName.trim())) {
    throw new Error(
      'switchProject requires a project name. Set Cypress env TEST_NS (or the variable passed to switchProject).',
    );
  }
  const name = typeof projectName === 'string' ? projectName : String(projectName);
  cy.get('body').then(($body) => {
    const hasTreeView = $body.find(TREEVIEW_ROOT_ID).length > 0;
    const nsBarHidden = $body.find('.co-namespace-bar').css('display') === 'none';

    if (hasTreeView || nsBarHidden) {
      cy.get(TREEVIEW_ROOT_ID, { timeout: 30000 });
      cy.switchProjectUsingTreeView(name);
    } else {
      cy.byLegacyTestID('namespace-bar-dropdown').contains('Project:').click();
      cy.byTestID('showSystemSwitch').check();
      cy.byTestID('dropdown-menu-item-link').contains(name).click();
    }
  });
});
