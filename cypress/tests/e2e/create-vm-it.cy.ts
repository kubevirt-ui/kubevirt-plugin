import { K8S_KIND, SECOND, TEST_NS, VM_STATUS } from '../../utils/const/index';
import { VM_IT_CUST, VM_IT_QUICK } from '../../utils/const/testVM';
import { tab } from '../../views/tab';
import { waitForStatus } from '../../views/vm';

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
    cy.visitCatalogVirt();
    cy.contains('#name', VM_IT_QUICK.volume).click();
    cy.contains('U series').click();
    cy.byLegacyTestID('instancetypes-vm-name-input').clear().type(VM_IT_QUICK.name);
    cy.wait(5 * SECOND);
    cy.byButtonText('Create VirtualMachine').click();
    cy.get('[data-test="global-notifications"]').scrollIntoView();
    waitForStatus(VM_IT_QUICK.name, VM_STATUS.Provisioning, false);
    waitForStatus(VM_IT_QUICK.name, VM_STATUS.Starting, false);
    waitForStatus(VM_IT_QUICK.name, VM_STATUS.Running, false);
  });

  it('Customize create VM from IT', () => {
    cy.visitCatalogVirt();
    cy.contains('#name', VM_IT_CUST.volume).click();
    cy.contains('U series').click();
    if (VM_IT_CUST.iType) {
      cy.contains(VM_IT_CUST.iType).click();
    }
    cy.byLegacyTestID('instancetypes-vm-name-input').clear().type(VM_IT_CUST.name);
    cy.byButtonText('Customize VirtualMachine').click();
    if (VM_IT_CUST.description) {
      cy.get(`button[data-test-id="${VM_IT_CUST.name}-description"]`).click();
      cy.get('[aria-label="description text area"]').clear().type(VM_IT_CUST.description);
      cy.clickSaveBtn();
      cy.contains(VM_IT_CUST.description).should('exist');
    }
    if (VM_IT_CUST.hostname) {
      cy.get(`button[data-test-id="${VM_IT_CUST.name}-hostname"]`).click();
      cy.get('#hostname').clear().type(VM_IT_CUST.hostname);
      cy.clickSaveBtn();
      cy.contains(VM_IT_CUST.hostname).should('exist');
    }
    if (VM_IT_CUST.headless) {
      cy.get('#headless-mode').check();
    }
    if (VM_IT_CUST.bootMode) {
      cy.contains('.pf-v5-c-expandable-section', 'Boot management').within(($section) => {
        if (!$section.hasClass('pf-v5-m-expanded')) {
          // cy.byButtonText('Boot management').click();
          cy.wrap($section).find('button.pf-v5-c-expandable-section__toggle').click();
        }
        cy.get(`button[data-test-id="${VM_IT_CUST.name}-boot-method"]`).click();
      });
      cy.get('#tab-modal').within(() => {
        cy.get('button.pf-v5-c-menu-toggle').click();
        cy.byButtonText(VM_IT_CUST.bootMode).click();
        cy.clickSaveBtn();
      });
      cy.contains(VM_IT_CUST.bootMode).should('exist');
    }
    if (VM_IT_CUST.username || VM_IT_CUST.password) {
      cy.byButtonText('Initial run').click();
      cy.contains('.pf-c-description-list__group', 'Cloud-init').within(() => {
        cy.byButtonText('Edit').click();
      });
      if (VM_IT_CUST.username) {
        cy.get('#cloudinit-user').clear().type(VM_IT_CUST.username);
      }
      if (VM_IT_CUST.password) {
        cy.get('#cloudinit-password').clear().type(VM_IT_CUST.password);
      }
      cy.clickApplyBtn();
      cy.contains(VM_IT_CUST.username).should('exist');
    }
    cy.wait(5 * SECOND);
    cy.byButtonText('Create VirtualMachine').click();
    cy.get('[data-test="global-notifications"]').scrollIntoView();
    waitForStatus(VM_IT_CUST.name, VM_STATUS.Provisioning, false);
    waitForStatus(VM_IT_CUST.name, VM_STATUS.Starting, false);
    waitForStatus(VM_IT_CUST.name, VM_STATUS.Running, false);
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
