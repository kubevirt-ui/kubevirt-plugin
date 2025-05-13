import { VirtualMachineData } from '../types/vm';
import { K8S_KIND } from '../utils/const/index';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      deleteResource(kind: string, name: string, namespace?: string): void;
      deleteVM(vms: VirtualMachineData[]): void;
      dropFile(filePath: string, fileName: string, inputSelector: string): void;
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

Cypress.Commands.add('deleteVM', (vms: VirtualMachineData[]) => {
  vms.forEach((vm) => {
    cy.exec(
      `oc delete --ignore-not-found=true -n ${vm.namespace} --cascade ${K8S_KIND.VM} ${vm.name} --wait=true --timeout=180s`,
      { failOnNonZeroExit: false, timeout: 1800000 },
    );
    cy.exec(
      `oc delete --ignore-not-found=true -n ${vm.namespace} vmi ${vm.name} --wait=true --timeout=180s`,
      { failOnNonZeroExit: false, timeout: 1800000 },
    );
  });
});

Cypress.Commands.add('dropFile', (filePath, fileName, inputSelector) => {
  cy.get(inputSelector).trigger('dragenter');
  cy.readFile(filePath, 'binary').then((f) => {
    const blob = Cypress.Blob.binaryStringToBlob(f);
    cy.window().then((win) => {
      const file = new win.File([blob], fileName);
      Cypress.log({ name: `${file.size}` });
      const dataTransfer = new win.DataTransfer();
      dataTransfer.items.add(file);
      cy.get(inputSelector).trigger('drop', { dataTransfer });
    });
  });
});
