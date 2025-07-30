import * as vmView from '../../../views/selector-common';
import { closeButton } from '../../../views/selector-overview';
import * as tView from '../../../views/selector-template';

describe('Test Catalog InstanceType section', () => {
  before(() => {
    cy.beforeSpec();
    cy.visitCatalog();
  });

  it('ID(CNV-10281) Test CLI and YAML in instanceTypes tab', () => {
    cy.contains('tr.pf-m-clickable', 'rhel9').click();
    cy.contains('U series').click();
    cy.byButtonText('medium').click();
    cy.contains(tView.listGroup, 'Operating system').should(
      'contain',
      'Red Hat Enterprise Linux 9',
    );
    cy.contains(tView.listGroup, 'InstanceType').should('contain', 'u1.medium');
    cy.byButtonText('YAML & CLI').click({ force: true });
    cy.get('.pf-v6-c-modal-box__body').within(() => {
      cy.byButtonText('CLI').click({ force: true });
      cy.contains('virtctl create vm').should('exist');
      cy.contains('--preference=rhel.9').should('exist');
      cy.contains(vmView.yamlEditor, '--instancetype=u1.medium').should('exist');
    });
    cy.get(closeButton).click({ force: true });
  });
});
