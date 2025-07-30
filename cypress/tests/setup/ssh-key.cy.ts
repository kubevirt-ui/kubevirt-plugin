import { TEST_NS, TEST_SECRET_NAME } from '../../utils/const/index';
import { authSSHKey } from '../../utils/const/string';
import * as cView from '../../views/selector-catalog';
import { tab } from '../../views/tab';

describe('Configure ssh key', () => {
  it('ID(CNV-10326) configure public ssh key', () => {
    cy.visitOverviewVirt();
    tab.navigateToSettings();
    cy.contains('button[role="tab"]', 'User').click();
    cy.contains(cView.manageKeysText).click();
    cy.contains(authSSHKey, { timeout: 20000 }).should('be.visible');
    cy.wait(2000);
    // configure public ssh key when it's not configured
    cy.get('.settings-tab__content').then(($body) => {
      if ($body.text().includes('Select project')) {
        cy.contains('Select project').click();
        cy.byLegacyTestID(TEST_NS).click({ force: true });
      }
      if ($body.text().includes('Not configured')) {
        cy.get('button.project-ssh-row__secret-name').click();
        cy.get(cView.useExisting).click();
        cy.contains('Select secret').click();
        cy.byButtonText(TEST_SECRET_NAME).click();
        cy.clickSaveBtn();
      }
    });
    cy.contains('button.project-ssh-row__secret-name', TEST_SECRET_NAME).should('exist');
  });
});
