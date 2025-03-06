import { MINUTE, SECOND, VM_ACTION, VM_STATUS } from '../../utils/const/index';
import { VM_IT_CUST, VM_IT_QUICK, VM_TMPL_CUST, VM_TMPL_QUICK } from '../../utils/const/testVM';
import * as nav from '../../views/selector';
import { descrText, selectAllBtn, vmStatusOnList } from '../../views/selector-common';
import { tab } from '../../views/tab';
import { vm } from '../../views/vm-flow';

describe('Create VMs from InstanceType', () => {
  before(() => {
    cy.visit('');
  });

  it('quick create VM from IT', () => {
    vm.instanceCreate(VM_IT_QUICK);
  });

  it('customize create VM from IT', () => {
    vm.customizeIT(VM_IT_CUST);
  });

  it('verify customized VM from IT', () => {
    cy.contains(descrText, VM_IT_CUST.iType).should('be.visible');
    cy.contains(descrText, 'centos.stream10').should('be.visible');
    tab.navigateToConfiguration();
    cy.contains(VM_IT_CUST.description).should('be.visible');
    cy.contains(VM_IT_CUST.hostname).should('be.visible');
    tab.navigateToConsole();
    cy.contains('.pf-v5-c-clipboard-copy', VM_IT_CUST.cloudInitUname).should('be.visible');
    cy.contains('.pf-v5-c-clipboard-copy', VM_IT_CUST.cloudInitPwd).should('be.visible');
  });
});

describe('Create VMs from Template', () => {
  it('quick create VM from Template', () => {
    vm.create(VM_TMPL_QUICK);
  });

  it('customize create VM from Template', () => {
    vm.customizeCreate(VM_TMPL_CUST);
  });

  it('verify customized VM from Template', () => {
    cy.contains(descrText, VM_TMPL_CUST.template.metadataName).should('be.visible');
    // cy.contains(descrText, 'Fedora Linux').should('be.visible');
    tab.navigateToConfiguration();
    cy.contains(VM_TMPL_CUST.description).should('be.visible');
    cy.contains(VM_TMPL_CUST.hostname).should('be.visible');
    cy.contains(VM_TMPL_CUST.bootMode).should('be.visible');
    tab.navigateToConsole();
    cy.contains('.pf-v5-c-clipboard-copy', VM_TMPL_CUST.cloudInitUname).should('be.visible');
    cy.contains('.pf-v5-c-clipboard-copy', VM_TMPL_CUST.cloudInitPwd).should('be.visible');
  });
});

describe('Test bulk actions', () => {
  it('stop all VMs by selection', () => {
    cy.visitVMs();
    cy.get(selectAllBtn).check();
    cy.byButtonText('Actions').click();
    cy.byButtonText(VM_ACTION.Stop).click();
    cy.wait(30 * SECOND);
    cy.clickVirtLink(nav.catalogNav);
    cy.wait(30 * SECOND);
    cy.clickVirtLink(nav.vmNav);
    cy.contains(vmStatusOnList, VM_STATUS.Running, { timeout: MINUTE }).should('not.exist');
  });
});
