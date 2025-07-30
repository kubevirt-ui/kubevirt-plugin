import { adminOnlyIT } from '../../../utils/const/index';
import { VM_IT_CUST } from '../../../utils/const/testVM';
import * as oView from '../../../views/selector-overview';

describe('Test Virtualization Overview page', () => {
  before(() => {
    cy.visit('');
    cy.switchToVirt();
    cy.visitOverviewVirt();
  });

  it('Verify links in get started are not outdated', () => {
    cy.get('[data-test-id="dashboard"]')
      .find('a')
      .each(($a) => {
        const message = $a.text();
        expect($a, message).to.have.attr('href').not.contain('4.15');
        expect($a, message).to.have.attr('href').not.contain('4.14');
      });
  });

  it('ID(CNV-7927) Quick Starts card is displayed', () => {
    cy.get(oView.quickStartsCard).should('exist');
  });

  it('ID(CNV-7924) Feature highlights card is displayed', () => {
    cy.get(oView.featureHighlightsCard).should('exist');
  });

  it('ID(CNV-7925) Related operators card is displayed', () => {
    cy.get(oView.relatedOperatorsCard).should('exist');
  });

  it('ID(CNV-9363) Resource cards are displayed', () => {
    cy.get(oView.resourceBlock)
      .should('exist')
      .within(() => {
        cy.contains(oView.resourceCard, 'VirtualMachines').should('exist');
        cy.contains(oView.resourceCard, 'vCPU usage').should('exist');
        cy.contains(oView.resourceCard, 'Memory').should('exist');
        cy.contains(oView.resourceCard, 'Storage').should('exist');
      });
  });

  it('ID(CNV-7929) VMs per Template card is displayed', () => {
    cy.get(oView.VMperTemplateCard).should('exist');
  });

  it('ID(CNV-9361) Download virtctl popover works', () => {
    cy.get('a.cluster-overview-header__virtctl-link').click();
    cy.contains('Download virtctl for Linux for x86_64').should('exist');
  });

  adminOnlyIT('ID(CNV-) click view all link on alerts card', () => {
    cy.visitOverviewVirt();
    cy.get('a.alerts-card__view-all-link').click();
    cy.contains('kubernetes_operator_part_of=kubevirt').should('exist');
  });

  adminOnlyIT('ID(CNV-) click the link on VM status', () => {
    cy.visitOverviewVirt();
    cy.get('div.vm-statuses-card__body')
      .find('span.vm-statuses-card__status-item--value')
      .eq(2)
      .find('a')
      .click();
    cy.contains(VM_IT_CUST.name).should('exist');
  });
});
