import { K8S_KIND, SECOND, TEST_NS, VM_STATUS } from '../../utils/const/index';
import { VM_IT_CUST, VM_IT_QUICK } from '../../utils/const/testVM';
import { tab } from '../../views/tab';
import { vm, waitForStatus } from '../../views/vm-flow';

export const deleteTestVMs = () => {
  cy.deleteResource(K8S_KIND.VM, VM_IT_QUICK.name, TEST_NS);
  cy.deleteResource(K8S_KIND.VM, VM_IT_CUST.name, TEST_NS);
};

describe('Create VMs from InstanceType', () => {
  before(() => {
    cy.visit('');
    cy.switchToVirt();
    deleteTestVMs();
  });

  after(() => {
    deleteTestVMs();
  });

  it('Quick create VM from IT', () => {
    vm.instanceCreate(VM_IT_QUICK);
  });

  it('Customize create VM from IT', () => {
    vm.customizeIT(VM_IT_CUST);
  });

  it('Verify customized VM', () => {
    cy.contains('.co-resource-item__resource-name', 'u1.small').should('exist');
    cy.contains('.co-resource-item__resource-name', 'rhel.9').should('exist');
    tab.navigateToConfiguration();
    cy.contains(VM_IT_CUST.description).should('exist');
    cy.contains(VM_IT_CUST.hostname).should('exist');
    cy.contains(VM_IT_CUST.bootMode).should('exist');
    tab.navigateToConsole();
    cy.contains('.pf-v5-c-clipboard-copy', VM_IT_CUST.username).should('exist');
    cy.contains('.pf-v5-c-clipboard-copy', VM_IT_CUST.password).should('exist');
  });

  it('Stop all VMs by selection', () => {
    cy.contains('button.pf-v5-c-tree-view__node-text', 'All projects').click();
    cy.get('input[name="check-all"]').check();
    cy.byButtonText('Actions').click();
    cy.byButtonText('Stop').click();
    cy.wait(30 * SECOND);
    cy.byButtonText('All projects').click();
    waitForStatus(VM_IT_QUICK.name, VM_STATUS.Stopped);
    waitForStatus(VM_IT_CUST.name, VM_STATUS.Stopped);
  });
});
