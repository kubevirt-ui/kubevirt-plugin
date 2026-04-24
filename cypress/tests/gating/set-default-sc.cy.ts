import { dsIT } from '../../utils/const/index';
import { kebabBtn } from '../../views/actions';

const cluster_default_sc = 'ocs-storagecluster-ceph-rbd-virtualization';

const getScRow = (name: string, within: VoidFunction) =>
  cy.byLegacyTestID(name).parents('tr').within(within);

describe('Set default storageclass', () => {
  before(() => {
    cy.beforeSpec();
    cy.visitStorageclass();
  });

  it('set default storageclass to another', () => {
    cy.exec('oc get sc -o json').then((result) => {
      const items = JSON.parse(result.stdout).items;
      const nonDefaultSc = items.find(
        (sc) =>
          sc.metadata?.annotations?.['storageclass.kubernetes.io/is-default-class'] !== 'true',
      );

      expect(nonDefaultSc, 'Expected at least one non-default StorageClass').to.not.be.undefined;
      const scName = nonDefaultSc.metadata.name;

      cy.task('log', `Setting non-default SC "${scName}" as default`);
      getScRow(scName, () => cy.get(kebabBtn).click());
      cy.get('[data-test-action="Set as default"]').click();
      getScRow(scName, () => cy.contains('Default').should('exist'));
    });
  });

  dsIT('restore storageclass to cluster default', () => {
    getScRow(cluster_default_sc, () => cy.get(kebabBtn).click());
    cy.get('[data-test-action="Set as default"]').click();
    getScRow(cluster_default_sc, () => cy.contains('Default').should('exist'));
  });
});
