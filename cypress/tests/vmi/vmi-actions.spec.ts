import { K8S_KIND, VM_STATUS } from '../../utils/const/index';
import { generateTestName } from '../../utils/const/names';
import { defaultSourceVM } from '../../utils/const/testVM';
import { vm, waitForStatus } from '../../views/vm';

const testName = generateTestName();

describe('Test VMI actions', () => {
  before(() => {
    cy.login();
    cy.visit('/');
    cy.newProject(testName);
    cy.selectProject(testName);
  });

  after(() => {
    cy.deleteResource(K8S_KIND.VM, defaultSourceVM.name, defaultSourceVM.namespace);
    cy.deleteProject(testName);
  });

  describe('Test VMI details view actions', () => {
    before(() => {
      vm.create(defaultSourceVM);
      vm.visitVMI(defaultSourceVM);
      waitForStatus(VM_STATUS.Running);
    });

    it('Open console', () => {
      cy.get('#VirtualMachinesInstanceActions').click();
      cy.window().then((win) => cy.stub(win, 'open'));
      cy.get('span').contains('Open Console').click();
      cy.window().its('open').should('have.been.called');
    });

    it('ID(CNV-765) Edit annotation', () => {
      cy.get('#VirtualMachinesInstanceActions').click();
      cy.get('span').contains('Edit Annotations').click();
      cy.get('#tab-modal').should('be.visible');
      cy.get('button').contains('Cancel').click();
    });

    it('ID(CNV-765) Edit labels', () => {
      cy.get('#VirtualMachinesInstanceActions').click();
      cy.get('span').contains('Edit Labels').click();
      cy.get('#tab-modal').should('be.visible');
      cy.get('button').contains('Cancel').click();
    });

    it('ID(CNV-4016) Deletes VM', () => {
      cy.get('#VirtualMachinesInstanceActions').click();
      cy.get('span').contains('Delete Virtual Machine Instance').click();
      cy.get('#tab-modal').should('be.visible');
      cy.get('button').contains('Delete').click();
    });
  });

  describe('Test VM detail list action', () => {
    before(() => {
      cy.visitVMIs();
    });

    it('Open console', () => {
      cy.get('#VirtualMachinesInstanceActions').click();
      cy.window().then((win) => cy.stub(win, 'open'));
      cy.get('span').contains('Open Console').click();
      cy.window().its('open').should('have.been.called');
    });

    it('ID(CNV-765) Edit annotation', () => {
      cy.get('#VirtualMachinesInstanceActions').click();
      cy.get('span').contains('Edit Annotations').click();
      cy.get('#tab-modal').should('be.visible');
      cy.get('button').contains('Cancel').click();
    });

    it('ID(CNV-765) Edit labels', () => {
      cy.get('#VirtualMachinesInstanceActions').click();
      cy.get('span').contains('Edit Labels').click();
      cy.get('#tab-modal').should('be.visible');
      cy.get('button').contains('Cancel').click();
    });

    it('ID(CNV-4016) Deletes VM', () => {
      cy.get('#VirtualMachinesInstanceActions').click();
      cy.get('span').contains('Delete Virtual Machine Instance').click();
      cy.get('#tab-modal').should('be.visible');
      cy.get('button').contains('Delete').click();
    });
  });
});
