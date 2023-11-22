import { adminOnlyDescribe } from '../utils/const/index';

adminOnlyDescribe('Test Getting started card of the Virtualization Overview page', () => {
  before(() => {
    cy.login();
    cy.visitOverview();
  });

  it('ID(CNV-7924) Feature highlights card is displayed', () => {
    cy.contains('Feature highlights').should('exist');
  });

  it('ID(CNV-7925) Related operators card is displayed', () => {
    cy.contains('Related operators').should('exist');
  });
});
