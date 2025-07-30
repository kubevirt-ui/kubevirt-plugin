import { TEST_NS } from '../../utils/const/index';
import { VM_IT_CUST, VM_TMPL_CUST } from '../../utils/const/testVM';
import { descrText } from '../../views/selector-common';
import { tab } from '../../views/tab';
import { vm } from '../../views/vm-flow';

function verifyCustomizedVM(vmConfig: typeof VM_IT_CUST, osDescription?: string) {
  if (osDescription) {
    cy.contains(descrText, osDescription).should('be.visible');
  }

  tab.navigateToConfiguration();
  cy.contains(vmConfig.description).should('be.visible');
  cy.contains(vmConfig.hostname).should('be.visible');

  if (vmConfig.bootMode) {
    cy.contains(vmConfig.bootMode).should('be.visible');
  }

  tab.navigateToConsole();
  verifyCloudInitCredentials(vmConfig.username, vmConfig.password);
}

function verifyCloudInitCredentials(username: string, password: string) {
  cy.byTestID('username-show-hide-button').click();
  cy.contains('.pf-v6-c-clipboard-copy', username).should('be.visible');

  cy.byTestID('password-show-hide-button').click();
  cy.contains('.pf-v6-c-clipboard-copy', password).should('be.visible');
}

const VM_NAMES = [VM_IT_CUST.name, VM_TMPL_CUST.name];

describe('Create customized VMs from InstanceType/Template', () => {
  before(() => {
    cy.beforeSpec();
    cy.visitCatalogVirt();
    cy.switchProject(TEST_NS);
  });

  after(() => {
    cy.stopVM(VM_NAMES);
  });

  describe('Custom VM from InstanceType', () => {
    it('should create VM from InstanceType with customization', () => {
      vm.customizeIT(VM_IT_CUST);
    });

    it('should verify the customized VM properties', () => {
      verifyCustomizedVM(VM_IT_CUST, 'centos.stream10');
    });
  });

  describe('Custom VM from Template', () => {
    it('should create VM from Template with customization', () => {
      vm.customizeCreate(VM_TMPL_CUST);
    });

    it('should verify the customized VM properties', () => {
      verifyCustomizedVM(VM_TMPL_CUST);
    });
  });
});
