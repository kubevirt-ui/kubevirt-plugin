import { K8S_KIND } from '../utils/const/index';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      createResource(resource: any): void;
      deleteResource(kind: string, name: string, namespace?: string): void;
    }
  }
}

Cypress.Commands.add('deleteResource', (kind: string, name: string, namespace?: string) => {
  // If cluster resource, ommit namespace
  if (!namespace) {
    cy.exec(
      `kubectl delete --ignore-not-found=true --cascade ${kind} ${name} --wait=true --timeout=180s || true`,
      { timeout: 180000 },
    );
    return;
  }
  cy.exec(
    `kubectl delete --ignore-not-found=true -n ${namespace} --cascade ${kind} ${name} --wait=true --timeout=120s || true`,
    { timeout: 120000 },
  );
  if (kind === K8S_KIND.VM) {
    // VMI may still be there while VM is being deleted. Wait for VMI to be deleted before continuing
    cy.exec(
      `kubectl delete --ignore-not-found=true -n ${namespace} vmi ${name} --wait=true --timeout=240s || true`,
      { timeout: 240000 },
    );
  }
});

Cypress.Commands.add('createResource', (resource) => {
  cy.exec(`echo '${JSON.stringify(resource)}' | kubectl create -f -`);
});
