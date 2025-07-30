import { VirtualMachineData } from '../../../types/vm';
import { K8S_KIND, TEST_NS, VM_STATUS } from '../../../utils/const/index';
import { TEMPLATE } from '../../../utils/const/template';
import { createBtn, itemCreateBtn } from '../../../views/selector-common';
import { vm, waitForStatus } from '../../../views/vm-flow';

const vmFromExampleTemplate: VirtualMachineData = {
  name: 'vm-from-template-example',
  namespace: TEST_NS,
  startOnCreation: true,
  template: TEMPLATE.YAML,
  userTemplate: true,
};

describe('Test VM from example template ', () => {
  before(() => {
    cy.beforeSpec();
  });

  after(() => {
    cy.deleteResource(K8S_KIND.VM, vmFromExampleTemplate.name, TEST_NS);
    cy.deleteResource(K8S_KIND.Template, 'example', TEST_NS);
  });

  it('ID(CNV-9891) create template from example', () => {
    cy.visitTemplates();
    cy.switchProject(TEST_NS);
    cy.get(itemCreateBtn).click();
    cy.get(createBtn).click();
    cy.contains('Template details').should('exist');
    cy.contains('Fedora VM').should('exist');
  });

  it('ID(CNV-8871) create VM from template example', () => {
    vm.create(vmFromExampleTemplate, false);
  });

  it(
    'ID(CNV-8871) verify the VM is running',
    {
      retries: {
        openMode: 0,
        runMode: 8,
      },
    },
    () => {
      waitForStatus(vmFromExampleTemplate.name, VM_STATUS.Running, false);
    },
  );
});
