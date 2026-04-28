import { DEFAULT_VM_NAME, TEST_NS } from '../../../utils/const/index';
import { Example } from '../../../utils/const/string';
import { navigateToConfigurationSubTab, subTabName } from '../../../views/tab';

const spec = '.spec.template.spec.domain.devices.interfaces';
const state_down = `"state":"down"`;
const state_up = `"state":"up"`;
const VMS = [{ name: Example, namespace: TEST_NS }];

describe('Set network down/up', () => {
  before(() => {
    cy.startVM(VMS);
    cy.beforeSpec();
  });

  after(() => {
    cy.stopVM(VMS);
  });

  it('navigate to network tab', () => {
    cy.visitVMsVirt();
    cy.switchProject(TEST_NS);
    cy.get(`[data-test-id="${DEFAULT_VM_NAME}"]`, { timeout: 180000 }).click();
    navigateToConfigurationSubTab(subTabName.Network);
  });

  it('set network link down', () => {
    cy.contains('Pod networking', { timeout: 120000 }).should('be.visible');
    cy.wait(5000);
    cy.get('#nic-actions-default').click({ force: true });
    cy.contains('.pf-v6-c-menu__item-text', 'Set link down').click();
    cy.get('svg[fill="red"]', { timeout: 60000 }).should('exist');
    cy.checkVMSpec(DEFAULT_VM_NAME, spec, state_down, true);
  });

  it('set network link up', () => {
    cy.get('#nic-actions-default').click({ force: true });
    cy.contains('.pf-v6-c-menu__item-text', 'Set link up').click();
    cy.get('svg[fill="green"]', { timeout: 60000 }).should('exist');
    cy.checkVMSpec(DEFAULT_VM_NAME, spec, state_up, true);
  });
});
