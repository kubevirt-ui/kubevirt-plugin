import { TEST_NS } from '../../utils/const/index';
import { VM_IT_CUST, VM_IT_QUICK, VM_TMPL_CUST, VM_TMPL_QUICK } from '../../utils/const/testVM';
import { descrText } from '../../views/selector-common';
import { tab } from '../../views/tab';
import { vm } from '../../views/vm-flow';

const verifyCloudInitCredentials = (username: string, password: string) => {
  cy.byTestID('username-show-hide-button').click();
  cy.contains('.pf-v6-c-clipboard-copy', username).should('be.visible');
  cy.byTestID('password-show-hide-button').click();
  cy.contains('.pf-v6-c-clipboard-copy', password).should('be.visible');
};

describe('Create VMs from InstanceType', () => {
  before(() => {
    cy.visitOverviewVirt();
    cy.visitCatalogVirt();
    cy.switchProject(TEST_NS);
  });

  it('quick create VM from IT', () => {
    vm.instanceCreate(VM_IT_QUICK);
  });

  it('customize create VM from IT', () => {
    vm.customizeIT(VM_IT_CUST);
  });

  it('verify customized VM from IT', () => {
    cy.contains(descrText, 'centos.stream10').should('be.visible');
    tab.navigateToConfiguration();
    cy.contains(VM_IT_CUST.description).should('be.visible');
    cy.contains(VM_IT_CUST.hostname).should('be.visible');
    tab.navigateToConsole();
    verifyCloudInitCredentials(VM_IT_CUST.cloudInitUname, VM_IT_CUST.cloudInitPwd);
  });

  it('quick create VM from Template', () => {
    vm.create(VM_TMPL_QUICK);
  });

  it('customize create VM from Template', () => {
    vm.customizeCreate(VM_TMPL_CUST);
  });

  it('verify customized VM from Template', () => {
    tab.navigateToConfiguration();
    cy.contains(VM_TMPL_CUST.description).should('be.visible');
    cy.contains(VM_TMPL_CUST.hostname).should('be.visible');
    cy.contains(VM_TMPL_CUST.bootMode).should('be.visible');
    tab.navigateToConsole();
    verifyCloudInitCredentials(VM_TMPL_CUST.cloudInitUname, VM_TMPL_CUST.cloudInitPwd);
  });
});
