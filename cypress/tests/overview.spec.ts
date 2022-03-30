import { adminOnlyDescribe } from '../consts';
import * as overview from '../views/overview';

adminOnlyDescribe('Test Getting started card of the Virtualization Overview page', () => {
  before(() => {
    cy.login();
    cy.visit('/overview');
  });

  it('ID(CNV-7924) Feature highlights card is displayed', () => {
    cy.get(overview.featureHighlightsCard).should('exist');
  });

  it('ID(CNV-7925) Recommended operators card is displayed', () => {
    cy.get(overview.recommendedOperatorsCard).should('exist');
  });
});
