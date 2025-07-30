import { DEFAULT_VM_NAME, TEST_NS, VM_STATUS } from '../../utils/const/index';
import { VM_IT_CUST, VM_TMPL_CUST } from '../../utils/const/testVM';
import { confirmBtn, projectActionStart } from '../../views/selector-common';
import { waitForStatus } from '../../views/vm-flow';

const VMs = [DEFAULT_VM_NAME, VM_IT_CUST.name, VM_TMPL_CUST.name];

describe('Right-click of project/folder', () => {
  before(() => {
    cy.beforeSpec();
    cy.stopVM(VMs);
  });

  after(() => {
    cy.stopVM(VMs);
  });

  it(
    'visit vm list page',
    {
      retries: {
        runMode: 8,
      },
    },
    () => {
      cy.visitCatalogVirt();
      cy.visitVMsVirt();
    },
  );

  it('start vms by right-click of project', () => {
    cy.byLegacyTestID(VM_IT_CUST.name).should('be.visible');
    cy.contains('button.pf-v6-c-tree-view__node-text', TEST_NS, { timeout: 180000 }).rightclick();
    cy.byLegacyTestID(projectActionStart).click();
    cy.get(confirmBtn).click();
    cy.wait(120000);
    waitForStatus(VM_TMPL_CUST.name, VM_STATUS.Running);
    waitForStatus(VM_IT_CUST.name, VM_STATUS.Running);
  });
});
