import { K8S_KIND } from '../utils/const/index';
import { saveBtn } from '../views/selector';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      deleteResource(kind: string, name: string, namespace?: string): void;
      saveYAML(): void;
    }
  }
}

Cypress.Commands.add('deleteResource', (kind: string, name: string, namespace?: string) => {
  // Use `oc` (not kubectl): OpenShift-only kinds like Template live under the
  // template.openshift.io API group, which kubectl's bundled REST mapper does
  // not resolve, so `kubectl delete Template ...` silently no-ops and leaves
  // the resource behind for the next run to collide with.
  // If cluster resource, ommit namespace
  if (!namespace) {
    cy.exec(
      `oc delete --ignore-not-found=true --cascade ${kind} ${name} --wait=true --timeout=180s`,
      { failOnNonZeroExit: false, timeout: 180000 },
    );
    return;
  }
  cy.exec(
    `oc delete --ignore-not-found=true -n ${namespace} --cascade ${kind} ${name} --wait=true --timeout=120s`,
    { failOnNonZeroExit: false, timeout: 120000 },
  );
  if (kind === K8S_KIND.VM) {
    // VMI may still be there while VM is being deleted. Wait for VMI to be deleted before continuing
    cy.exec(
      `oc delete --ignore-not-found=true -n ${namespace} vmi ${name} --wait=true --timeout=240s`,
      { failOnNonZeroExit: false, timeout: 240000 },
    );
  }
});

Cypress.Commands.add('saveYAML', () => {
  // The console's Create-from-YAML editor loads its example template into the
  // editor model asynchronously. Clicking Save before the model is populated
  // fails with "No YAML content found" -- the resource is never created, which
  // silently cascades into downstream tests. Give the editor time to load, save,
  // and if the model still wasn't ready (the console surfaces that exact error),
  // wait for it to load and retry the save.
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(5000);
  cy.get(saveBtn).click();
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000);
  cy.get('body').then(($body) => {
    if ($body.text().includes('No YAML content found')) {
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(10000);
      cy.get(saveBtn).click();
    }
  });
});
