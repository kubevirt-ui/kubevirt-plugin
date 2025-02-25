import secretFixture from '../../fixtures/secret';
import { CLEANUP_SCRIPT, MINUTE, TEST_NS, TEST_SECRET_NAME } from '../../utils/const/index';
import { authSSHKey } from '../../utils/const/string';
import { brandImage } from '../../views/selector';
import { manageKeysText, useExisting } from '../../views/selector-catalog';
import { tab } from '../../views/tab';

const WELCOME_OFF_CMD = `oc patch configmap -n kubevirt-hyperconverged kubevirt-user-settings --type=merge --patch '{"data": {"kube-admin": "{\\"quickStart\\":{\\"dontShowWelcomeModal\\":true}}"}}'`;
const TREEVIEW_ON_CMD = `oc patch configmap -n kubevirt-hyperconverged kubevirt-ui-features --type=merge --patch '{"data": {"treeView": "true", "treeViewFolders": "true"}}'`;

describe('Prepare the cluster for test', () => {
  before(() => {
    cy.login();
    cy.exec('oc whoami').then((result) => {
      cy.task('log', `Running as: [${result.stdout}]`);
    });
  });

  it('clean cluster of shared resources', () => {
    cy.exec(CLEANUP_SCRIPT, { timeout: 3 * MINUTE });
  });

  it('create test secret', () => {
    cy.exec(`echo '${JSON.stringify(secretFixture)}' | oc create -f -`);
  });

  it('close the welcome modal', () => {
    cy.exec(WELCOME_OFF_CMD).then((result) => {
      cy.task('log', `WELCOME_OFF_CMD: [${result.stdout}]`);
    });
  });

  it('enable treeview and folders', () => {
    cy.exec(TREEVIEW_ON_CMD).then((result) => {
      cy.task('log', `TREEVIEW_ON_CMD: [${result.stdout}]`);
    });
  });

  xit('switch to Virtualization perspective and default project', () => {
    cy.task('log', `  Switch to Virtualization perspective`);
    cy.get(brandImage).scrollIntoView();
    cy.switchToVirt();

    // needed because of https://issues.redhat.com/browse/CNV-51570
    cy.switchProject(TEST_NS);
  });

  it('configure public ssh key', () => {
    cy.visitOverview();
    tab.navigateToSettings();
    cy.contains('button[role="tab"]', 'User').click();
    cy.contains(manageKeysText).click();
    cy.contains(authSSHKey, { timeout: 20000 }).should('be.visible');
    cy.wait(2000);
    // configure new public ssh key
    cy.get('.settings-tab__content').then(() => {
      cy.contains('Select project').click();
      cy.byLegacyTestID(TEST_NS).click({ force: true });
      cy.get('button.project-ssh-row__secret-name').click();
      cy.get(useExisting).click();
      cy.contains('Select secret').click();
      cy.byButtonText(TEST_SECRET_NAME).click();
      cy.clickSaveBtn();
    });
    cy.contains('button.project-ssh-row__secret-name', TEST_SECRET_NAME).should('exist');
  });
});
