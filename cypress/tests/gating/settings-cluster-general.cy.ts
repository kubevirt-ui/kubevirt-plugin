import { CNV_NS, SECOND } from '../../utils/const/index';
import { tab } from '../../views/tab';

const MEMORY_DENSITY_VALUE = '400';

describe('Test Cluster General settings', () => {
  before(() => {
    cy.beforeSpec();
    tab.navigateToSettings();
  });

  describe('Check installed version appears', () => {
    it('check version', () => {
      cy.get('[data-test-id="general-information-installed-version"]').contains('4');
      cy.get('[data-test-id="general-information-update-status"]').contains('Up to date');
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
      const maxPerCluster = '.spec.virtualization.liveMigrationConfig.parallelMigrationsPerCluster';
      const maxPerNode =
        '.spec.virtualization.liveMigrationConfig.parallelOutboundMigrationsPerNode';
      const spec = '.spec.virtualization.liveMigrationConfig';
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
      // Click the visible PF Switch (not the hidden input) so React onChange fires in CI.
      cy.get('#memory-density-feature')
        .find('input.pf-v6-c-switch__input')
        .then(($input) => {
          if (!$input.is(':checked')) {
            cy.get('#memory-density-feature').find('.pf-v6-c-switch').click();
          }
        });
      cy.contains('Current memory density', { timeout: 30000 }).should('be.visible').click();
      cy.wait(SECOND);
      cy.get('[data-test-id="memory-density-slider"]')
        .find('input[type="number"]')
        .dblclick()
        .clear()
        .type(MEMORY_DENSITY_VALUE);
      cy.contains('Requested memory density').click();
      cy.get('[data-test-id="memory-density-save-button"]').click({ force: true });
      cy.contains(`Current memory density: ${MEMORY_DENSITY_VALUE}%`, {
        timeout: 30000,
      }).should('be.visible');
    });

    it('verify higherWorkloadDensity in HCO', () => {
      const percentage = '.spec.virtualization.higherWorkloadDensity.memoryOvercommitPercentage';
      cy.checkHCOSpec(percentage, MEMORY_DENSITY_VALUE, true);
    });

    it('disable memory density', () => {
      // Wait until UI reflects HCO value > 100% so the confirm modal path is taken.
      cy.contains(`Current memory density: ${MEMORY_DENSITY_VALUE}%`, {
        timeout: 30000,
      }).should('be.visible');
      // Switch sits above the slider; after scrolling to density controls it is often
      // clipped by ExpandableSection overflow, so scroll back and force-click.
      cy.get('#memory-density-feature').scrollIntoView();
      cy.get('#memory-density-feature')
        .find('.pf-v6-c-switch')
        .scrollIntoView()
        .click({ force: true });
      cy.get('[data-test-id="memory-density-disable-confirm-button"]', { timeout: 30000 })
        .should('be.visible')
        .click();
      cy.wait(10 * SECOND);
    });

    it('verify higherWorkloadDensity in HCO', () => {
      const percentage = '.spec.virtualization.higherWorkloadDensity.memoryOvercommitPercentage';
      cy.checkHCOSpec(percentage, '100', true);
    });
  });
});
