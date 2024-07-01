import { K8S_KIND } from '../utils/const/index';
import { vm } from '../views/vm';

const VM_EXAMPLE_NAME = 'example';

describe('Check all virtualization pages can be loaded', () => {
  before(() => {
    cy.login();
  });

  after(() => {
    cy.deleteResource(K8S_KIND.VM, VM_EXAMPLE_NAME, 'default');
  });

  describe('Check VM list filters', () => {
    it('create example VM', () => {
      cy.visitVMs();
      vm.createVMFromYAML();
      cy.visitVMs();

      cy.byTestID('name-filter-input').type('example-123');

      cy.byTestID('name-filter-input').should('be.visible');
      cy.contains('Learn how to use VirtualMachines').should('not.be.visible');
    });
  });
});
