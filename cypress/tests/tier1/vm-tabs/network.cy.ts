import { Example } from '../../../utils/const/string';
import { navigateToConfigurationSubTab, subTabName } from '../../../views/tab';

const spec = '.spec.template.spec.domain.devices.interfaces';
const state_down = `"state":"down"`;
const state_up = `"state":"up"`;

describe('Set network down/up', () => {
  before(() => {
    cy.login();
    cy.visit('');
    cy.visitVMs();
  });

  it('navigate to network tab', () => {
    cy.get(`[data-test-id="${Example}"]`, { timeout: 180000 }).click();
    navigateToConfigurationSubTab(subTabName.Network);
  });

  it('set network link down', () => {
    cy.contains('Pod networking', { timeout: 120000 }).should('be.visible');
    cy.wait(5000);
    cy.get('#toggle-id-6').click({ force: true });
    //cy.get('[data-test-id="set-link-down"]').should('be.visible').click();
    cy.contains('.pf-v6-c-menu__item-text', 'Set link down').click();
    cy.get('svg[fill="red"]', { timeout: 60000 }).should('exist');
    cy.checkVMSpec(Example, spec, state_down, true);
  });

  it('set network link up', () => {
    cy.get('#toggle-id-6').click({ force: true });
    //cy.get('[data-test-id="set-link-up"]').should('be.visible').click();
    cy.contains('.pf-v6-c-menu__item-text', 'Set link up').click();
    cy.get('svg[fill="green"]', { timeout: 60000 }).should('exist');
    cy.checkVMSpec(Example, spec, state_up, true);
  });
});
