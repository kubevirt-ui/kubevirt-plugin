import { TEST_NS, TEST_SECRET_NAME } from '../../utils/const/index';
import { authSSHKey, YAML } from '../../utils/const/string';
import { itemCreateBtn, mastheadLogo, saveBtn } from '../../views/selector';
import { manageKeysText, useExisting } from '../../views/selector-catalog';
import { tab } from '../../views/tab';

function configureSSHSecret() {
  cy.byLegacyTestID('select-project-toggle').click();
  cy.byLegacyTestID(`select-option-${TEST_NS}`).click({ force: true });
  cy.get('button.project-ssh-row__secret-name').click();
  cy.get(useExisting).click();
  cy.contains('Select secret').click();
  cy.byButtonText(TEST_SECRET_NAME).click();
  cy.clickSaveBtn();
}

describe('Cluster Test Preparation', () => {
  before(() => {
    cy.login();
    cy.get(mastheadLogo).scrollIntoView();
    cy.switchToVirt();
    cy.switchProject(TEST_NS);
  });

  it('configure public ssh key', () => {
    cy.visitVMsVirt();
    cy.visitOverviewVirt();

    tab.navigateToSettings();
    cy.byButtonText('User').click();
    cy.byButtonText(manageKeysText).click();

    cy.contains(authSSHKey, { timeout: 20000 }).should('be.visible');
    cy.wait(10000);

    cy.byLegacyTestID('settings-user-ssh-key')
      .then(($body) => {
        if ($body.text().includes(TEST_SECRET_NAME)) {
          cy.task('log', 'SSH secret is already configured');
        } else {
          configureSSHSecret();
        }
      })
      .then(() => {
        cy.contains('button.project-ssh-row__secret-name', TEST_SECRET_NAME).should('exist');
      });
  });

  it('create example VM', () => {
    cy.visitVMsVirt();
    cy.get(itemCreateBtn, { timeout: 60000 }).first().click();
    cy.byButtonText(YAML).click();
    cy.get(saveBtn).click();
  });
});
