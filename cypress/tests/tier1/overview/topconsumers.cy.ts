import { adminOnlyDescribe } from '../../../utils/const/index';
import { tab } from '../../../views/tab';

adminOnlyDescribe('Test Virtualization Top consumer tab', () => {
  before(() => {
    cy.beforeSpec();
    cy.visitOverviewVirt();
  });

  it('ID(CNV-9295) check data available for cpu, memory and storage', () => {
    tab.navigateToTopConsumers();
    cy.get('.pf-v6-c-card__body.kv-top-consumers-card__chart-list-container')
      .eq(0)
      .should('not.contain', 'No data available');
    cy.get('.pf-v6-c-card__body.kv-top-consumers-card__chart-list-container')
      .eq(4)
      .should('not.contain', 'No data available');
    cy.get('.pf-v6-c-card__body.kv-top-consumers-card__chart-list-container')
      .eq(5)
      .should('not.contain', 'No data available');
  });

  xit('ID(CNV-9295) click the view link on the page', () => {
    cy.contains('View virtualization dashboard').click();
    cy.contains('KubeVirt / Infrastructure Resources / Top Consumers').should('exist');
  });
});
