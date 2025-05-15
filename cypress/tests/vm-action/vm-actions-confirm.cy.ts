import { Example } from '../../utils/const/string';
import { tab } from '../../views/tab';

describe('Test VM actions confirm', () => {
  before(() => {
    cy.login();
    cy.visit('');
    cy.switchToVirt();
  });

  it('navigate to settings', () => {
    cy.visitCatalogVirt();
    cy.visitOverviewVirt();
    tab.navigateToSettings();
  });

  it('enable actions confirm', () => {
    cy.contains('General settings').click();
    cy.contains('VirtualMachine actions confirmation').click();
    cy.get('#confirm-vm-actions').find('input.pf-v6-c-switch__input').check({ force: true });
  });

  it('navigate to example vm', () => {
    cy.visitVMsVirt();
    cy.byLegacyTestID(Example).click();
  });

  it('verify confirm message on VM actions', () => {
    // confirm message appears for restart
    cy.get('.kv-actions-dropdown').click();
    cy.get('[data-test-id="vm-action-restart"]').click();
    cy.contains('.pf-v6-c-modal-box__title-text', 'Restart VirtualMachine?').should('be.visible');
    cy.contains('.pf-v6-c-button__text', 'Restart').click();
  });
});
