import { TEST_NS, TEST_SECRET_NAME } from '../../utils/const/index';
import { authSSHKey, YAML } from '../../utils/const/string';
import { itemCreateBtn, saveBtn } from '../../views/selector';
import { manageKeysText, useExisting } from '../../views/selector-catalog';
import { tab } from '../../views/tab';

describe('Prepare the cluster for test', () => {
  before(() => {
    cy.login();
    cy.exec('oc whoami').then((result) => {
      cy.task('log', `Running as: [${result.stdout}]`);
    });
  });

  it('switch to Virtualization perspective and default project', () => {
    cy.scrollTo('top');
    cy.switchToVirt();
    cy.switchProject(TEST_NS);
  });

  it('configure public ssh key', () => {
    cy.visitVMsVirt();
    cy.visitOverviewVirt();
    tab.navigateToSettings();
    cy.contains('button[role="tab"]', 'User').click();
    cy.contains(manageKeysText).click();
    cy.contains(authSSHKey, { timeout: 20000 }).should('be.visible');
    cy.wait(10000);
    cy.get('.settings-tab__content').then(($body) => {
      if ($body.text().includes(TEST_SECRET_NAME)) {
        cy.task('log', 'secret is configured');
      } else {
        cy.contains('Select project').click();
        cy.byLegacyTestID(TEST_NS).click({ force: true });
        cy.get('button.project-ssh-row__secret-name').click();
        cy.get(useExisting).click();
        cy.contains('Select secret').click();
        cy.byButtonText(TEST_SECRET_NAME).click();
        cy.clickSaveBtn();
      }
      cy.contains('button.project-ssh-row__secret-name', TEST_SECRET_NAME).should('exist');
    });
  });

  it('create example VM', () => {
    cy.visitVMsVirt();
    cy.get(itemCreateBtn, { timeout: 60000 }).click();
    cy.byButtonText(YAML).click();
    cy.get(saveBtn).click();
  });
});
