import { getRow, kebabBtn } from '../../views/actions';

const gp2_csi = 'gp2-csi';

describe('Set default storageclass', () => {
  before(() => {
    cy.beforeSpec();
    cy.visitStorageclass();
  });

  it('set default sc to another', () => {
    cy.exec('oc get storageclass').then((result) => {
      cy.task('log', result);
    });
    getRow(gp2_csi, () => cy.get(kebabBtn).click());
    cy.get('[data-test-action="Set as default"]').click();
    getRow(gp2_csi, () => cy.contains('Default').should('exist'));
  });
});
