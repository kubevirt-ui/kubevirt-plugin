import { tab } from '../../views/tab';

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
});
