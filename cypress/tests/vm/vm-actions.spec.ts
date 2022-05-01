import { K8S_KIND, VM_STATUS } from '../../utils/const/index';
import { generateTestName } from '../../utils/const/names';
import { defaultSourceVM } from '../../utils/const/testVM';
import { vm, waitForStatus } from '../../views/vm';

const testName = generateTestName();

describe('Test VM actions', () => {
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

  describe('Test VM details view actions', () => {
    before(() => {
      vm.create(defaultSourceVM);
      waitForStatus(VM_STATUS.Running);
    });

    it('ID(CNV-4015) Stops VM', () => {
      cy.get('#VirtualMachineActions').click();
      cy.get('a').contains('Stop').click();
      waitForStatus(VM_STATUS.Stopped);
    });

    it('ID(CNV-4013) Starts VM', () => {
      cy.get('#VirtualMachineActions').click();
      cy.get('a').contains('Start').click();
      waitForStatus(VM_STATUS.Running);
    });

    it('ID(CNV-765) Pause VM', () => {
      cy.get('#VirtualMachineActions').click();
      cy.get('a').contains('Pause').click();
      waitForStatus(VM_STATUS.Paused);
    });

    it('ID(CNV-765) Unpause VM', () => {
      cy.get('#VirtualMachineActions').click();
      cy.get('a').contains('Unpause').click();
      waitForStatus(VM_STATUS.Running);
    });

    it('ID(CNV-765) Clone VM', () => {
      cy.get('#VirtualMachineActions').click();
      cy.get('a').contains('Clone').click();
      cy.get('#tab-modal').should('be.visible');
      cy.get('button').contains('Cancel').click();
    });

    it('ID(CNV-765) Edit annotation', () => {
      cy.get('#VirtualMachineActions').click();
      cy.get('a').contains('Edit annotations').click();
      cy.get('#tab-modal').should('be.visible');
      cy.get('button').contains('Cancel').click();
    });

    it('ID(CNV-765) Edit labels', () => {
      cy.get('#VirtualMachineActions').click();
      cy.get('a').contains('Edit labels').click();
      cy.get('#tab-modal').should('be.visible');
      cy.get('button').contains('Cancel').click();
    });

    it('ID(CNV-4014) Restarts VM', () => {
      cy.get('#VirtualMachineActions').click();
      cy.get('a').contains('Restart').click();
      waitForStatus(VM_STATUS.Running);
    });

    it('ID(CNV-4016) Deletes VM', () => {
      cy.get('#VirtualMachineActions').click();
      cy.get('a').contains('Delete').click();
      cy.get('#tab-modal').should('be.visible');
      cy.get('button').contains('Delete').click();
      cy.contains('No VirtualMachines found').should('be.visible');
    });
  });

  describe('Test VM detail list action', () => {
    before(() => {
      vm.create(defaultSourceVM);
      waitForStatus(VM_STATUS.Running);
      cy.visitVMs();
    });

    it('ID(CNV-4015) Stops VM', () => {
      cy.get('#VirtualMachineActions').click();
      cy.get('a').contains('Stop').click();
      waitForStatus(VM_STATUS.Stopped);
    });

    it('ID(CNV-4013) Starts VM', () => {
      cy.get('#VirtualMachineActions').click();
      cy.get('a').contains('Start').click();
      waitForStatus(VM_STATUS.Running);
    });

    it('ID(CNV-765) Pause VM', () => {
      cy.get('#VirtualMachineActions').click();
      cy.get('a').contains('Pause').click();
      waitForStatus(VM_STATUS.Paused);
    });

    it('ID(CNV-765) Unpause VM', () => {
      cy.get('#VirtualMachineActions').click();
      cy.get('a').contains('Unpause').click();
      waitForStatus(VM_STATUS.Running);
    });

    it('ID(CNV-765) Clone VM', () => {
      cy.get('#VirtualMachineActions').click();
      cy.get('a').contains('Clone').click();
      cy.get('#tab-modal').should('be.visible');
      cy.get('button').contains('Cancel').click();
    });

    it('ID(CNV-765) Edit annotation', () => {
      cy.get('#VirtualMachineActions').click();
      cy.get('a').contains('Edit annotations').click();
      cy.get('#tab-modal').should('be.visible');
      cy.get('button').contains('Cancel').click();
    });

    it('ID(CNV-765) Edit labels', () => {
      cy.get('#VirtualMachineActions').click();
      cy.get('a').contains('Edit labels').click();
      cy.get('#tab-modal').should('be.visible');
      cy.get('button').contains('Cancel').click();
    });

    it('ID(CNV-4014) Restarts VM', () => {
      cy.get('#VirtualMachineActions').click();
      cy.get('a').contains('Restart').click();
      waitForStatus(VM_STATUS.Running);
    });

    it('ID(CNV-4016) Deletes VM', () => {
      cy.get('#VirtualMachineActions').click();
      cy.get('a').contains('Delete').click();
      cy.get('#tab-modal').should('be.visible');
      cy.get('button').contains('Delete').click();
      cy.contains('No VirtualMachines found').should('be.visible');
    });
  });
});
