import { ALL_PROJ_NS, SECOND, TEST_NS } from '../utils/const/index';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      newProject(name: string): void;
      selectProject(name: string): void;
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

// Switches project by rewriting the URL namespace segment, preserving the current resource type.
// Only the first resource path segment is kept (e.g. /k8s/ns/<ns>/<resource>);
// deeper sub-paths (VM detail pages, tabs) are dropped intentionally.
const buildProjectPath = (currentUrl: string, projectName: string): string => {
  const url = new URL(currentUrl);
  const path = url.pathname;
  const nsSegment = projectName === ALL_PROJ_NS ? 'all-namespaces' : `ns/${projectName}`;

  let resource: string;
  if (path.includes('/fleet-virtualization/')) {
    const match = path.match(/\/fleet-virtualization\/([^/]+)/);
    resource = match?.[1] ?? 'kubevirt.io~v1~VirtualMachine';
  } else {
    // Standard pattern: /k8s/ns/<ns>/<resource>/... or /k8s/all-namespaces/<resource>/...
    const match = path.match(/\/k8s\/(?:ns\/[^/]+|all-namespaces)\/([^/]+)/);
    resource = match?.[1] ?? 'kubevirt.io~v1~VirtualMachine';
  }

  return `/k8s/${nsSegment}/${resource}${url.search}${url.hash}`;
};

Cypress.Commands.add('switchProject', (projectName: string) => {
  if (projectName == null || (typeof projectName === 'string' && !projectName.trim())) {
    throw new Error(
      'switchProject requires a project name. Set Cypress env TEST_NS (or the variable passed to switchProject).',
    );
  }
  const name = typeof projectName === 'string' ? projectName : String(projectName);

  cy.url().then((currentUrl) => {
    const newPath = buildProjectPath(currentUrl, name);

    // Uses client-side navigation (pushState + popstate) so the SPA
    // re-renders without a full page reload, preserving the active perspective.
    cy.window().then((win) => {
      win.localStorage.setItem('showEmptyProjects', 'show');
      win.history.pushState(null, '', newPath);
      win.dispatchEvent(new PopStateEvent('popstate'));
    });

    cy.wait(2 * SECOND);
  });
});
