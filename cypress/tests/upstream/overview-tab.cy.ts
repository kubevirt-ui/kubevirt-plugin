import { DEFAULT_VM_NAME } from '../../utils/const/index';
import * as oView from '../../views/selector-overview';

describe('Test Virtualization Overview page', () => {
  before(() => {
    cy.beforeSpec();
    cy.visitOverviewVirt();
  });

  it('Verify links in get started are not outdated', () => {
    cy.get('[data-test-id="dashboard"]', { timeout: 90000 })
      .find('a')
      .each(($a) => {
        const message = $a.text();
        expect($a, message).to.have.attr('href').not.contain('4.16');
        expect($a, message).to.have.attr('href').not.contain('4.15');
        expect($a, message).to.have.attr('href').not.contain('4.14');
      });
  });

  it('feature highlights card is displayed', () => {
    cy.get(oView.featureHighlightsCard).should('exist');
  });

  it('related operators card is displayed', () => {
    cy.get(oView.relatedOperatorsCard).should('exist');
  });

  it('resource cards are displayed', () => {
    cy.get(oView.resourceBlock)
      .should('exist')
      .within(() => {
        cy.contains(oView.resourceCard, 'VirtualMachines').should('exist');
        cy.contains(oView.resourceCard, 'vCPU usage').should('exist');
        cy.contains(oView.resourceCard, 'Memory').should('exist');
        cy.contains(oView.resourceCard, 'Storage').should('exist');
      });
  });

  it('VMs per Template card is displayed', () => {
    cy.get(oView.VMperTemplateCard).should('exist');
  });

  it('download virtctl popover works', () => {
    cy.get('a.cluster-overview-header__virtctl-link').click();
    cy.contains('Download virtctl for Linux for x86_64').should('exist');
  });

  xit('click view all link on alerts card', () => {
    cy.visitOverviewVirt();
    cy.get('a.alerts-card__view-all-link').click();
    cy.contains('kubernetes_operator_part_of=kubevirt').should('exist');
  });

  it('click the link on VM status', () => {
    cy.visitOverviewVirt();
    cy.get('div.vm-statuses-card__body')
      .find('span.vm-statuses-card__status-item--value')
      .eq(1)
      .find('a')
      .click();
    cy.contains(DEFAULT_VM_NAME).should('exist');
  });
});
