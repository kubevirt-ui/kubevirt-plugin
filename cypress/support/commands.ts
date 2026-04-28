import { VirtualMachineData } from 'types/vm';

import { CNV_NS, K8S_KIND, TEST_NS } from '../utils/const/index';
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
      containsExactMatch(
        matchString: string,
        options?: Partial<Loggable & Timeoutable & Withinable & Shadow>,
      ): Chainable;
      deleteVM(vmName: string[]): void;
      patchVM(vmName: string, namespace: string, status: string): void;
      startVM(vmName: VirtualMachineData[]): void;
      stopVM(vmName: VirtualMachineData[]): void;
      switchToVirt(): void;
    }
  }
}

Cypress.Commands.add('containsExactMatch', (matchString: string, options) =>
  cy.contains(new RegExp(`^${matchString}$`), options),
);

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

Cypress.Commands.add('patchVM', (vmName: string, namespace: string, status: string) => {
  cy.exec(
    `oc -n "${namespace}" patch virtualmachine "${vmName}" --type merge -p '{"spec":{"runStrategy":"${status}"}}'`,
  );
});

Cypress.Commands.add('startVM', (vms: VirtualMachineData[]) => {
  vms.forEach(({ name, namespace }) => {
    cy.patchVM(name, namespace, 'Always');
    cy.exec(`oc wait --for=condition=ready vm/${name} -n ${namespace} --timeout=300s`, {
      timeout: 300000,
    });
  });
});

Cypress.Commands.add('stopVM', (vms: VirtualMachineData[]) => {
  vms.forEach(({ name, namespace }) => {
    cy.patchVM(name, namespace, 'Halted');
  });
});

Cypress.Commands.add('switchToVirt', () => {
  return switchPerspective(Perspective.Virtualization);
});

Cypress.Commands.add('beforeSpec', () => {
  cy.login();
  cy.switchToVirt();
  cy.visitVMsVirt();
});

Cypress.Commands.add('deleteVM', (vms: string[]) => {
  vms.forEach((vmName) => {
    cy.exec(
      `oc delete --ignore-not-found=true --cascade ${K8S_KIND.VM} ${vmName} -n ${TEST_NS} --wait=true --timeout=180s`,
      { failOnNonZeroExit: false, timeout: 1800000 },
    );
  });
});
