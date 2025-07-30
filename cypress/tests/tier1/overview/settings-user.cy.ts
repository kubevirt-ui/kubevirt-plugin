import { nonPrivIT } from '../../../utils/const/index';
import * as iView from '../../../views/selector-instance';
import * as oView from '../../../views/selector-overview';
import { tab } from '../../../views/tab';

describe('Test Welcome information', () => {
  before(() => {
    cy.beforeSpec();
    cy.visitOverviewVirt();
  });

  it('ID(CNV-10325) test Virtualization welcome modal', () => {
    if (!Cypress.env('NON_PRIV')) {
      tab.navigateToSettings();
      cy.byButtonText(iView.userButtonTxt).click();
      cy.byButtonText('Getting started resources').click();
      cy.contains(oView.switchLabel, 'Welcome information')
        .find(':checkbox')
        .check({ force: true });
    }
    cy.wait(8000);
    cy.get('body').then(($body) => {
      if ($body.text().includes('Do not show this again')) {
        cy.checkSubTitle('Welcome to');
        cy.checkTitle(iView.osVirt);
        cy.byButtonText(iView.createBtnText).click();
        cy.wait(3000);
        cy.contains('centos-stream9').should('be.visible');
        cy.visitOverviewVirt();
        cy.wait(8000);
        cy.get(oView.welcomeCheckbox).check();
        tab.navigateToSettings();
        cy.byButtonText(iView.userButtonTxt).click();
        cy.byButtonText('Getting started resources').click();
        cy.contains(oView.switchLabel, 'Welcome information').within(() => {
          cy.get(oView.switchInput).should('not.be.checked');
        });
      }
    });
  });

  // ensure the welcome modal is closed if above test is failed
  nonPrivIT('ID(CNV-10325) ensure the welcome modal is closed', () => {
    cy.visitOverviewVirt();
    cy.wait(8000);
    cy.get('body').then(($body) => {
      if ($body.text().includes('Do not show this again')) {
        cy.get(oView.welcomeCheckbox).check();
      }
    });
  });
});

describe('Test User permissions', () => {
  it('ID(CNV-10791) verify user permissions', () => {
    cy.visitOverviewVirt();
    tab.navigateToSettings();
    cy.byButtonText(iView.userButtonTxt).click();
    cy.byButtonText('Permissions').click();
    cy.contains('Attach VirtualMachine to multiple networks').should('exist');
    cy.contains('Clone a VirtualMachine').should('exist');
    cy.contains('Upload a base image from local disk').should('exist');
  });
});

describe('Test Guided tour', () => {
  it('ID(CNV-11414) Guided tour', () => {
    cy.visitOverviewVirt();
    tab.navigateToSettings();
    cy.byButtonText(iView.userButtonTxt).click();
    cy.byButtonText('Getting started resources').click();
    cy.contains(oView.switchLabel, 'Guided tour').find(oView.switchInput).check({ force: true });
    cy.contains(oView.tourHeader, 'Getting started resources').should('exist');
    cy.contains(oView.stepCount, 'Step 1/8').should('exist');
    cy.byButtonText('Next').click();
    cy.contains(oView.tourHeader, 'Project selector').should('exist');
    cy.contains(oView.stepCount, 'Step 2/8').should('exist');
    cy.byButtonText('Next').click();
    cy.contains(oView.tourHeader, 'Settings configurations').should('exist');
    cy.contains(oView.stepCount, 'Step 3/8').should('exist');
    cy.byButtonText('Next').click();
    cy.contains(oView.tourHeader, 'Tree view').should('exist');
    cy.contains(oView.stepCount, 'Step 4/8').should('exist');
    cy.byButtonText('Next').click();
    cy.contains(oView.tourHeader, 'Add volume').should('exist');
    cy.contains(oView.stepCount, 'Step 5/8').should('exist');
    cy.byButtonText('Next').click();
    cy.contains(oView.tourHeader, 'Public SSH key').should('exist');
    cy.contains(oView.stepCount, 'Step 6/8').should('exist');
    cy.byButtonText('Next').click();
    cy.contains(oView.tourHeader, 'Search for configurable items').should('exist');
    cy.contains(oView.stepCount, 'Step 7/8').should('exist');
    cy.byButtonText('Next').click();
    cy.contains(oView.tourHeader, 'You are ready to go!').should('exist');
    cy.contains(oView.stepCount, 'Step 8/8').should('exist');
    cy.byButtonText('Okay').click();
  });
});
