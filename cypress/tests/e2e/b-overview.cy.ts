import { TEST_NS } from '../../utils/const/index';
import { authSSHKey } from '../../utils/const/string';
import { tabModal } from '../../views/actions';
import { addNew, manageKeysText, secretName, uploadSecret } from '../../views/selector-catalog';
import { userButtonTxt } from '../../views/selector-instance';
import { tab } from '../../views/tab';

const testSecret = 'test-secret';

describe('Test Virtualization Overview', () => {
  before(() => {
    cy.visit('');
  });

  it('overview page is loaded', () => {
    cy.visitOverview();
    cy.contains('VirtualMachine statuses').should('exist');
  });

  it('top consumer tab is loaded', () => {
    tab.navigateToTopConsumers();
    cy.contains('View virtualization dashboard').should('be.visible');
  });

  it('migration tab is loaded', () => {
    tab.navigateToMigrations();
    cy.contains('VirtualMachineInstanceMigrations information').should('be.visible');
  });

  it('settings tab is loaded', () => {
    tab.navigateToSettings();
    cy.contains('General settings').should('be.visible');
  });

  it('test saving SSH key', () => {
    cy.byButtonText(userButtonTxt).click();
    cy.byButtonText(manageKeysText).click();
    cy.byButtonText(manageKeysText)
      .parent()
      .within(() => {
        cy.contains(authSSHKey, { timeout: 20000 }).should('be.visible');
      });
    // configure public ssh key when it's not configured
    cy.get('.settings-tab__content').then(($body) => {
      if ($body.text().includes('Select project')) {
        cy.contains('Select project').click();
        cy.byLegacyTestID(TEST_NS).click({ force: true });
      }
    });
    cy.get('button.project-ssh-row__secret-name').click();
    cy.get(tabModal).within(() => {
      cy.get(addNew).click();
      cy.dropFile('./fixtures/rsa.pub', 'rsa.pub', uploadSecret);
      cy.wait(1000);
      cy.get(secretName).type(testSecret);
      cy.clickSaveBtn();
    });
    cy.byButtonText(testSecret).should('exist');
  });
});
