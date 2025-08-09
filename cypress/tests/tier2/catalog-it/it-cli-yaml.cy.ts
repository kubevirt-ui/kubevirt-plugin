import { SECOND } from '../../../utils/const/index';
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
    cy.byButtonText('YAML & CLI').click();
    cy.get('.pf-v6-c-modal-box__body').within(() => {
      cy.byButtonText('CLI').click();
      cy.contains(vmView.yamlEditor, 'virtctl create vm')
        .should('contain', '--preference=rhel.9')
        .and('contain', '--instancetype=u1.medium');
    });
    cy.get(closeButton).click({ force: true });
  });
});
