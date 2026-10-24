import { ALL_PROJ_NS, TEST_NS, TREEVIEW_ROOT_ID } from '../utils/const/index';

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
  // Hot-cluster CI forbids ProjectRequest (`oc new-project`); create the Namespace
  // directly. Recreate if a prior run left it Terminating.
  cy.exec(
    `phase=$(oc get ns ${project} -o jsonpath='{.status.phase}' 2>/dev/null || echo Missing); \
     if [ "$phase" = "Terminating" ]; then \
       oc delete ns ${project} --wait=true --timeout=180s; \
       phase=Missing; \
     fi; \
     if [ "$phase" = "Missing" ]; then \
       oc create namespace ${project}; \
     fi`,
    { timeout: 240000 },
  );
  cy.exec(`oc get ns ${project} -o jsonpath='{.status.phase}'`)
    .its('stdout')
    .should('eq', 'Active');
  if (Cypress.env('NON_PRIV')) {
    cy.exec(`oc adm policy add-role-to-user admin test -n ${project}`);
  }
});

Cypress.Commands.add('selectTestProject', () => {
  cy.selectProject(TEST_NS);
});

Cypress.Commands.add('switchProjectUsingTreeView', (projectName: string) => {
  cy.get(`li#projectSelector/${projectName}`).click();
});

// Rewrites the URL namespace segment so newly created / empty projects (e.g.
// auto-search-ns) are selectable even when the Project dropdown is filtered or
// the VMs tree view only lists projects that already contain VMs.
const buildProjectPath = (currentUrl: string, projectName: string): string => {
  const url = new URL(currentUrl);
  const path = url.pathname;
  const nsSegment = projectName === ALL_PROJ_NS ? 'all-namespaces' : `ns/${projectName}`;

  let resource: string;
  if (path.includes('/fleet-virtualization/')) {
    const match = path.match(/\/fleet-virtualization\/([^/]+)/);
    resource = match?.[1] ?? 'kubevirt.io~v1~VirtualMachine';
  } else {
    const match = path.match(/\/k8s\/(?:ns\/[^/]+|all-namespaces)\/([^/]+)/);
    resource = match?.[1] ?? 'kubevirt.io~v1~VirtualMachine';
  }

  return `/k8s/${nsSegment}/${resource}${url.search}${url.hash}`;
};

Cypress.Commands.add('switchProject', (projectName: string) => {
  if (projectName == null || (typeof projectName === 'string' && !projectName.trim())) {
    throw new Error(`switchProject: projectName is required, got ${JSON.stringify(projectName)}`);
  }
  const name = typeof projectName === 'string' ? projectName : String(projectName);

  cy.get('body').then(($body) => {
    if ($body.find(TREEVIEW_ROOT_ID).length && $body.find(`li#projectSelector/${name}`).length) {
      cy.switchProjectUsingTreeView(name);
      return;
    }

    cy.url().then((currentUrl) => {
      const newPath = buildProjectPath(currentUrl, name);
      // Client-side navigation preserves the Virtualization perspective.
      cy.window().then((win) => {
        win.localStorage.setItem('showEmptyProjects', 'show');
        win.history.pushState(null, '', newPath);
        win.dispatchEvent(new PopStateEvent('popstate'));
      });
    });
  });
});
