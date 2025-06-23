import { dsIT } from '../../utils/const/index';
import { getRow, kebabBtn } from '../../views/actions';

const cluster_default_sc = 'ocs-storagecluster-ceph-rbd-virtualization';

describe('Set default storageclass', () => {
  before(() => {
    cy.beforeSpec();
    cy.visitStorageclass();
  });

  it('set default storageclass to another', () => {
    cy.exec('oc get sc -o custom-columns=NAME:metadata.name --no-headers | head -n 1').then(
      (result) => {
        cy.task('log', result);
        getRow(result.stdout, () => cy.get(kebabBtn).click());
        cy.get('[data-test-action="Set as default"]').click();
        getRow(result.stdout, () => cy.contains('Default').should('exist'));
      },
    );
  });

  dsIT('restore storageclass to cluster default', () => {
    getRow(cluster_default_sc, () => cy.get(kebabBtn).click());
    cy.get('[data-test-action="Set as default"]').click();
    getRow(cluster_default_sc, () => cy.contains('Default').should('exist'));
  });
});
