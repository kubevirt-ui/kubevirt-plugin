import { adminOnlyDescribe, EXAMPLE, SECOND } from '../../../utils/const/index';
import * as vmView from '../../../views/selector-common';
import { tab } from '../../../views/tab';

adminOnlyDescribe('Test VM SSH tab', () => {
  before(() => {
    cy.beforeSpec();
  });

  it('ID(CNV-10283) Enable SSH using any load balancer', () => {
    cy.visitOverviewVirt();
    tab.navigateToSettings();
    cy.contains('General settings').click();
    cy.contains('SSH configurations').click();
    cy.contains('LoadBalancer service').click();
    cy.get('#load-balancer-feature').find(':checkbox').check({ force: true });
  });

  it(
    'visit vm list page',
    {
      retries: {
        openMode: 0,
        runMode: 8,
      },
    },
    () => {
      cy.visitVMs();
    },
  );

  it('ID(CNV-8890) Navigate to VM SSH tab', () => {
    cy.byLegacyTestID(EXAMPLE).click();
    tab.navigateToConfigurationDetails();
    cy.wait(10 * SECOND);
    tab.navigateToConfigurationSSH();
  });

  xit('ID(CNV-8890) VM SSH over Nodeport is enabled', () => {
    cy.get('[data-test-id="ssh-access"]').within(() => {
      cy.get('button').click();
    });
    cy.get(vmView.sshTypeNodeport).click();
    cy.wait(10 * SECOND);
    cy.get(vmView.sshOverVirtctl).should('exist');
    cy.get(vmView.sshCommandCopy).should('exist');
  });

  it(
    'ID(CNV-10311) VM SSH over LoadBalancer is enabled',
    {
      retries: {
        openMode: 0,
        runMode: 8,
      },
    },
    () => {
      cy.get('[data-test-id="ssh-access"]').within(() => {
        cy.get('button').eq(0).click();
        // cy.get(vmView.sshCommandCopy, { timeout: 3 * MINUTE }).should('exist');
      });
      cy.get(vmView.sshTypeLB).click();
      // cy.wait(20 * SECOND);
      cy.contains('In progress').should('exist');
    },
  );
});
