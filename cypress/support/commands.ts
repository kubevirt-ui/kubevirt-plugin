import { CNV_NS } from '../utils/const/index';

export {};
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      checkHCOSpec(spec: string, matchString: string, include: boolean): void;
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
