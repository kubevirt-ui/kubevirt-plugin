import { TEST_NS, VM_STATUS } from '../../../utils/const/index';
import { VM_IT_CUST, VM_TMPL_CUST } from '../../../utils/const/testVM';
import { projectActionStop } from '../../../views/selector-common';
import { waitForStatus } from '../../../views/vm-flow';

const VM_NAMES = [VM_IT_CUST.name, VM_TMPL_CUST.name];

describe('Right-click of project/folder', () => {
  before(() => {
    cy.startVM(VM_NAMES);
    cy.beforeSpec();
    cy.visitVMsVirt();
  });

  after(() => {
    cy.stopVM(VM_NAMES);
  });

  it('stop vms by right-click of project', () => {
    cy.byLegacyTestID(VM_IT_CUST.name).should('be.visible');
    cy.contains('button.pf-v6-c-tree-view__node-text', TEST_NS, { timeout: 180000 }).rightclick();
    cy.byLegacyTestID(projectActionStop).click();
    waitForStatus(VM_TMPL_CUST.name, VM_STATUS.Stopped);
    waitForStatus(VM_IT_CUST.name, VM_STATUS.Stopped);
  });
});
