import { dsIT } from '../../utils/const/index';
import { kebabBtn } from '../../views/actions';

const cluster_default_sc = 'ocs-storagecluster-ceph-rbd-virtualization';

// The console's StorageClasses table doesn't tag its rows with
// data-test-rows="resource-row" (unlike the kubevirt list tables that the
// shared getRow() targets), so match the row by its name within the table <tr>.
const getSCRow = (name: string, within: VoidFunction) =>
  cy.contains('tr', name.trim()).within(within);

describe('Set default storageclass', () => {
  before(() => {
    cy.beforeSpec();
    cy.visitStorageclass();
  });

  it('set default storageclass to another', () => {
    // IBM VPC hot clusters have ibmc-vpc-block-* (not AWS gp2-csi). Pick any
    // available StorageClass dynamically.
    cy.exec('oc get sc -o custom-columns=NAME:metadata.name --no-headers | head -n 1').then(
      (result) => {
        cy.task('log', result);
        getSCRow(result.stdout, () => cy.get(kebabBtn).click());
        cy.get('[data-test-action="Set as default"]').click();
        getSCRow(result.stdout, () => cy.contains('Default').should('exist'));
      },
    );
  });

  dsIT('restore storageclass to cluster default', () => {
    getSCRow(cluster_default_sc, () => cy.get(kebabBtn).click());
    cy.get('[data-test-action="Set as default"]').click();
    getSCRow(cluster_default_sc, () => cy.contains('Default').should('exist'));
  });
});
