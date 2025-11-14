import { Example } from '../../utils/const/string';
import { action, CONTROL_MENU, RESTART } from '../../views/actions';
import { tab } from '../../views/tab';

describe('Test VM actions confirm', () => {
  before('navigate to settings', () => {
    cy.beforeSpec();
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
    action.restart(undefined, false);

    cy.contains('.pf-v6-c-modal-box__title-text', 'Restart VirtualMachine?').should('be.visible');
    cy.contains('.pf-v6-c-button__text', 'Restart').click();
  });
});
