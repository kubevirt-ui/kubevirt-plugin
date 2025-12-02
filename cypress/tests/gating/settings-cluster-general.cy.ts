import { CNV_NS, SECOND } from '../../utils/const/index';
import { tab } from '../../views/tab';

const MEMORY_DENSITY_VALUE = '400';

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
      cy.wait(3 * SECOND);
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

  describe('Test Memory density', () => {
    it('set memory density', () => {
      cy.contains('Memory density').click();
      cy.wait(3 * SECOND);
      cy.get('[data-test-id="memory-density"]').check({ force: true });
      cy.wait(10 * SECOND);
      cy.contains('Current memory density').click();
      cy.wait(SECOND);
      cy.get('[data-test-id="memory-density-slider"]')
        .find('input[type="number"]')
        .dblclick()
        .clear()
        .type(MEMORY_DENSITY_VALUE);
      cy.contains('Requested memory density').click();
      cy.get('[data-test-id="memory-density-save-button"]').click({ force: true });
    });

    it('verify higherWorkloadDensity in HCO', () => {
      const percentage = '.spec.higherWorkloadDensity.memoryOvercommitPercentage';
      cy.checkHCOSpec(percentage, MEMORY_DENSITY_VALUE, true);
    });

    it('disable memory density', () => {
      cy.get('[data-test-id="memory-density"]').uncheck({ force: true });
      cy.get('[data-test-id="memory-density-disable-confirm-button"]').click({ force: true });
      cy.wait(10 * SECOND);
    });

    it('verify higherWorkloadDensity in HCO', () => {
      const percentage = '.spec.higherWorkloadDensity.memoryOvercommitPercentage';
      cy.checkHCOSpec(percentage, '100', true);
    });
  });
});
