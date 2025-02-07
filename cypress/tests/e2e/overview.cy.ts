import { tab } from '../../views/tab';

import { tickWelcomeModal } from './setup.cy';

describe('Test Virtualization Overview', () => {
  before(() => {
    cy.visit('');
  });

  it('overview page is loaded', () => {
    tickWelcomeModal();
    cy.visitOverview();
    cy.contains('VirtualMachine statuses').should('exist');
  });

  it('top consumer tab is loaded', () => {
    tickWelcomeModal();
    tab.navigateToTopConsumers();
    cy.contains('View virtualization dashboard').should('be.visible');
  });

  it('migration tab is loaded', () => {
    tickWelcomeModal();
    tab.navigateToMigrations();
    cy.contains('VirtualMachineInstanceMigrations information').should('be.visible');
  });

  it('settings tab is loaded', () => {
    tickWelcomeModal();
    tab.navigateToSettings();
    cy.contains('General settings').should('be.visible');
  });
});
