import { adminOnlyDescribe, EXAMPLE, K8S_KIND, SECOND } from '../../../utils/const/index';

adminOnlyDescribe('Test instanceType page', () => {
  before(() => {
    cy.deleteResource(K8S_KIND.VMCI, EXAMPLE);
  });

  after(() => {
    cy.deleteResource(K8S_KIND.VMCI, EXAMPLE);
  });

  it('ID(CNV-10367) create example instanceType', () => {
    cy.visitVMCI();
    cy.wait(3 * SECOND);
    cy.get('[data-test-id="cx1.medium"]').should('exist');
    cy.get('[data-test-id="details-actions"]').find('button').click();
    cy.get('[data-test="save-changes"]').click();
    cy.wait(3 * SECOND);
    cy.visitCatalog();
    cy.wait(3 * SECOND);
    cy.visitVMCI();
    cy.wait(3 * SECOND);
    cy.get('[data-test-id="example"]').should('exist');
    cy.get('input[data-test="name-filter-input"]').eq(0).type(EXAMPLE);
    cy.get('[data-test-id="example"]').should('exist');
    cy.get('[data-test-id="cx1.medium"]').should('not.exist');
  });
});
