import secretFixture from '../../fixtures/secret';
import { CLEANUP_SCRIPT, MINUTE, SECOND, TEST_NS } from '../../utils/const/index';
import { brandImage, welcomeCheckbox } from '../../views/selector';

export const tickWelcomeModal = () => {
  cy.wait(10 * SECOND);
  cy.get('body').then(($body) => {
    if ($body.text().includes('Welcome to')) {
      cy.wait(3 * SECOND);
      cy.get(welcomeCheckbox).check({ force: true });
      // cy.contains('Do not show this again').click();
      cy.wait(3 * SECOND);
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

  it(
    'close the welcome modal',
    {
      retries: {
        runMode: 8,
      },
    },
    () => {
      // sometimes the welcome is presenting before move to Overview, sometimes it's late
      tickWelcomeModal();
      cy.visitOverview();
    },
  );

  // ensure the welcome modal is closed on overview page
  it(
    'ensure the welcome modal is closed',
    {
      retries: {
        openMode: 0,
        runMode: 5,
      },
    },
    () => {
      tickWelcomeModal();
      cy.visitVolumes();
      cy.wait(3 * SECOND);
      cy.visitOverview();
      cy.wait(5 * SECOND);
      tickWelcomeModal();
    },
  );

  xit('switch to Virtualization perspective and default project', () => {
    cy.task('log', `  Switch to Virtualization perspective`);
    cy.get(brandImage).scrollIntoView();
    cy.switchToVirt();

    // needed because of https://issues.redhat.com/browse/CNV-51570
    cy.switchProject(TEST_NS);
  });
});
