import secretFixture from '../../fixtures/secret';
import { CLEANUP_SCRIPT, MINUTE, SECOND } from '../../utils/const/index';
import { welcomeCheckbox } from '../../views/selector';
import { tab } from '../../views/tab';

export const tickWelcomeModal = () => {
  cy.wait(10 * SECOND);
  cy.get('body').then(($body) => {
    if ($body.text().includes('Do not show this again')) {
      cy.get(welcomeCheckbox).check();
      cy.wait(SECOND);
      cy.contains('Do not show this again').should('not.exist');
      cy.task('log', '    Welcome modal was closed');
    } else {
      cy.task('log', '    Welcome modal was not found');
    }
  });
};

describe('Login before all tests', () => {
  it('login the console ', () => {
    cy.login();
  });
});

describe('Prepare the cluster for test', () => {
  before(() => {
    cy.visit('');
  });

  it('clean cluster of shared resources', () => {
    cy.exec(CLEANUP_SCRIPT, { timeout: 3 * MINUTE });
  });

  it('create test secret', () => {
    cy.exec(`echo '${JSON.stringify(secretFixture)}' | oc create -f -`);
  });

  it('close the welcome modal', () => {
    // sometimes the welcome is presenting before move to Overview, sometimes it's late
    tickWelcomeModal();
    cy.visitOverview();
    tickWelcomeModal();
    tab.navigateToSettings();
    tickWelcomeModal();
  });
});
