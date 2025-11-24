import { CNV_NS, SECOND } from '../../utils/const/index';
import { tab } from '../../views/tab';

describe('Test Cluster General settings', () => {
  before(() => {
    cy.beforeSpec();
    tab.navigateToOverview();
    tab.navigateToSettings();
  });

  describe('Check installed version appears', () => {
    it('check version', () => {
      cy.get('[data-test="detail-item-value"]').contains('4');
      cy.get('[data-test="detail-item-value"]').contains('Up to date');
    });
  });

  describe('Test Live migration', () => {
    it('set live migration limits', () => {
      cy.contains('General settings').click();
      cy.contains('Live migration').click();
      cy.wait(3000);
      cy.get('input[name="parallelMigrationsPerCluster"]').clear().type('4');
      cy.get('input[name="parallelOutboundMigrationsPerNode"]').clear().type('1');
      cy.contains('Set live migration network').click();
      cy.wait(10 * SECOND);
    });

    it('verify live migration limits in HCO', () => {
      const maxPerCluster = '.spec.liveMigrationConfig.parallelMigrationsPerCluster';
      const maxPerNode = '.spec.liveMigrationConfig.parallelOutboundMigrationsPerNode';
      const spec = '.spec.liveMigrationConfig';
      const cmd = `oc get -n ${CNV_NS} hyperconverged kubevirt-hyperconverged -o jsonpath='{${spec}}'`;
      cy.exec(cmd).then((res) => {
        cy.task('log', res.stdout);
      });
      cy.checkHCOSpec(maxPerCluster, '4', true);
      cy.checkHCOSpec(maxPerNode, '1', true);
    });
  });

  xdescribe('Test Memory density', () => {
    it('enable memory density', () => {
      cy.contains('Memory density').click();
      cy.wait(3000);
      cy.get('[id="memory-density-feature"]').find('input[type="checkbox"]').check({ force: true });
      cy.wait(10 * SECOND);
    });

    it('verify higherWorkloadDensity in HCO', () => {
      const percentage = '.spec.higherWorkloadDensity.memoryOvercommitPercentage';
      cy.checkHCOSpec(percentage, '150', true);
    });

    it('disable memory density', () => {
      cy.get('[id="memory-density-feature"]')
        .find('input[type="checkbox"]')
        .uncheck({ force: true });
      cy.wait(10 * SECOND);
    });

    it('verify higherWorkloadDensity in HCO', () => {
      const percentage = '.spec.higherWorkloadDensity.memoryOvercommitPercentage';
      cy.checkHCOSpec(percentage, '100', true);
    });
  });
});
