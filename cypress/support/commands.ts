import { CNV_NS, TEST_NS } from '../utils/const/index';

export {};
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      checkHCOSpec(spec: string, matchString: string, include: boolean): void;
      checkVMSpec(vmName: string, spec: string, matchString: string, include: boolean): void;
      patchVM(vmName: string, status: string): void;
      startVM(vmName: string): void;
      stopVM(vmName: string): void;
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

Cypress.Commands.add(
  'checkVMSpec',
  (vmName: string, spec: string, matchString: string, include: boolean) => {
    cy.exec(`oc get -n ${TEST_NS} vm ${vmName} -o jsonpath='{${spec}}'`).then((result) => {
      if (include) {
        expect(result.stdout).contain(matchString);
      } else {
        expect(result.stdout).not.contain(matchString);
      }
    });
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
