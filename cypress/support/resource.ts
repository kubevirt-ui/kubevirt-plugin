import { K8S_KIND } from '../utils/const/index';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      deleteResource(kind: string, name: string, namespace?: string): void;
    }
  }
}

Cypress.Commands.add('deleteResource', (kind: string, name: string, namespace?: string) => {
  // If cluster resource, ommit namespace
  if (!namespace) {
    cy.exec(
      `oc delete --ignore-not-found=true --cascade ${kind} ${name} --wait=false --timeout=180s`,
      { failOnNonZeroExit: false, timeout: 1800000 },
    );
    return;
  }
  cy.exec(
    `oc delete --ignore-not-found=true -n ${namespace} --cascade ${kind} ${name} --wait=false --timeout=180s`,
    { failOnNonZeroExit: false, timeout: 1800000 },
  );
  if (kind === K8S_KIND.VM) {
    // VMI may still be there while VM is being deleted. Wait for VMI to be deleted before continuing
    cy.exec(
      `oc delete --ignore-not-found=true -n ${namespace} vmi ${name} --wait=false --timeout=180s`,
      { failOnNonZeroExit: false, timeout: 1800000 },
    );
  }
});
