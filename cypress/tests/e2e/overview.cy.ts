import { welcomeCheckbox } from '../../views/selector';
import { tab } from '../../views/tab';

const tickWelcomeModal = () => {
  cy.get('body').then(($body) => {
    if ($body.text().includes('Do not show this again')) {
      cy.get(welcomeCheckbox).check();
    }
  });
};

// skip the test due to it cannot close the welcome modal
xdescribe('Close the welcome modal', () => {
  before(() => {
    cy.visit('');
    cy.wait(20000);
  });

  it('close the welcome modal', () => {
    // sometimes the welcome is presenting before move to Overview
    tickWelcomeModal();

    cy.wait(5000);
    cy.visitOverview();
    cy.wait(10000);
    tickWelcomeModal();
    cy.contains('Do not show this again').should('not.exist');
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
});
