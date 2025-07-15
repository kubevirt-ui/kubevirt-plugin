import { CNV_NS, TEST_NS } from '../utils/const/index';
import { Perspective, switchPerspective } from '../views/perspective';

export {};
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      beforeSpec(): void;
      checkHCOSpec(spec: string, matchString: string, include: boolean): void;
      checkVMISpec(vmName: string, spec: string, matchString: string, include: boolean): void;
      checkVMSpec(vmName: string, spec: string, matchString: string, include: boolean): void;
      patchVM(vmName: string, status: string): void;
      startVM(vmName: string): void;
      stopVM(vmName: string): void;
      switchToVirt(): void;
    }
  }
}

Cypress.Commands.add('checkHCOSpec', (spec: string, matchString: string, include: boolean) => {
  cy.exec(
    `oc get -n ${CNV_NS} hyperconverged kubevirt-hyperconverged -o jsonpath='{${spec}}'`,
  ).then((result) => {
    if (include) {
      expect(result.stdout).contain(matchString);
    } else {
      expect(result.stdout).not.contain(matchString);
    }
  });
});

const checkSpec = (
  resourceType: string,
  vmName: string,
  jsonPath: string,
  matchString: string,
  include: boolean,
) => {
  cy.exec(`oc get -n ${TEST_NS} ${resourceType} ${vmName} -o jsonpath='{${jsonPath}}'`).then(
    (result) => {
      if (include) {
        expect(result.stdout).contain(matchString);
      } else {
        expect(result.stdout).not.contain(matchString);
      }
    },
  );
};

Cypress.Commands.add(
  'checkVMSpec',
  (vmName: string, spec: string, matchString: string, include: boolean) => {
    checkSpec('vm', vmName, spec, matchString, include);
  },
);

Cypress.Commands.add(
  'checkVMISpec',
  (vmName: string, spec: string, matchString: string, include: boolean) => {
    checkSpec('vmi', vmName, spec, matchString, include);
  },
);

Cypress.Commands.add('patchVM', (vmName: string, status: string) => {
  cy.exec(
    `oc patch virtualmachine ${vmName} --type merge -p '{"spec":{"runStrategy":"${status}"}}'`,
  );
});

Cypress.Commands.add('startVM', (vmName: string) => {
  cy.patchVM(vmName, 'Always');
  cy.exec(`oc wait --for=condition=ready vm/${vmName} --timeout=120s`, { timeout: 120000 });
});

Cypress.Commands.add('stopVM', (vmName: string) => {
  cy.patchVM(vmName, 'Halted');
});

Cypress.Commands.add('switchToVirt', () => {
  return switchPerspective(Perspective.Virtualization);
});

Cypress.Commands.add('beforeSpec', () => {
  cy.visit('');
  cy.get('[data-test="username"]', { timeout: 180000 }).should('exist');
  cy.switchToVirt();
  cy.contains('[data-test-id="resource-title"]', 'Virtualization', { timeout: 180000 }).should(
    'exist',
  );
});
