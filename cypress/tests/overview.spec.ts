import { adminOnlyDescribe } from '../utils/const/index';
import * as overview from '../views/overview';

adminOnlyDescribe('Test Getting started card of the Virtualization Overview page', () => {
  before(() => {
    cy.login();
    cy.visit('/overview');
  });

  xit('ID(CNV-7924) Feature highlights card is displayed', () => {
    cy.get(overview.featureHighlightsCard).should('exist');
    expect('test').toEqual('test');
  });

  xit('ID(CNV-7925) Recommended operators card is displayed', () => {
    cy.get(overview.recommendedOperatorsCard).should('exist');
  });
});
