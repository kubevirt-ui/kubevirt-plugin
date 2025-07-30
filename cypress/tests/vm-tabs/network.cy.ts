import { Example } from '../../utils/const/string';
import { navigateToConfigurationSubTab, subTabName } from '../../views/tab';

const spec = '.spec.template.spec.domain.devices.interfaces';
const state_down = `"state":"down"`;
const state_up = `"state":"up"`;
const VM_NAMES = [Example];

describe('Set network down/up', () => {
  before(() => {
    cy.startVM(VM_NAMES);
    cy.beforeSpec();
  });

  after(() => {
    cy.stopVM(VM_NAMES);
  });

  it('navigate to network tab', () => {
    cy.visitVMsVirt();
    cy.get(`[data-test-id="${Example}"]`, { timeout: 180000 }).click();
    navigateToConfigurationSubTab(subTabName.Network);
  });

  it('set network link down', () => {
    cy.contains('Pod networking', { timeout: 120000 }).should('be.visible');
    cy.wait(5000);
    cy.get('#toggle-id-6').click({ force: true });
    cy.get('[data-test-id="set-link-down"]').should('be.visible').click();
    cy.get('svg[fill="red"]', { timeout: 60000 }).should('exist');
    cy.checkVMSpec(Example, spec, state_down, true);
  });

  it('set network link up', () => {
    cy.get('#toggle-id-6').click({ force: true });
    cy.get('[data-test-id="set-link-up"]').should('be.visible').click();
    cy.get('svg[fill="green"]', { timeout: 60000 }).should('exist');
    cy.checkVMSpec(Example, spec, state_up, true);
  });
});
