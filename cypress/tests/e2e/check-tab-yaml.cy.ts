import { Example, WithYAML } from '../../utils/const/string';
import { TEMPLATE } from '../../utils/const/template';
import { breadcrumb, itemCreateBtn, nameFilter, saveBtn } from '../../views/selector';
import { tab } from '../../views/tab';

describe('Check all virtualization pages can be loaded', () => {
  before(() => {
    cy.visit('');
  });

  describe('Check VM tabs', () => {
    it('visit VM list page', () => {
      cy.visitVMs();
    });

    it('create example VM', () => {
      cy.get(itemCreateBtn).click();
      cy.byButtonText(WithYAML).click();
      cy.get(saveBtn).click();
    });

    it('vm tabs are loaded', () => {
      cy.contains('Machine type').should('be.visible');

      tab.navigateToMetrics();
      cy.contains('Utilization').should('be.visible');

      tab.navigateToYAML();
      cy.contains('Download').should('be.visible');

      tab.navigateToEvents();
      cy.contains('event').should('be.visible');

      tab.navigateToConsole();
      cy.contains('This VirtualMachine is down').should('be.visible');

      // skip the test due to error happens on this page
      // tab.navigateToSnapshots();
      // cy.contains('No snapshots found').should('be.visible');

      tab.navigateToDiagnostics();
      cy.contains('Status conditions').should('be.visible');

      // sub-tabs in configuration tab
      tab.navigateToConfiguration();
      cy.contains('Headless mode').should('be.visible');

      tab.navigateToStorage();
      cy.contains('rootdisk').should('be.visible');

      tab.navigateToNetwork();
      cy.contains('Pod networking').should('be.visible');

      tab.navigateToScheduling();
      cy.contains('Scheduling and resource requirements').should('be.visible');

      tab.navigateToSSH();
      cy.contains('SSH access').should('be.visible');

      tab.navigateToInitialRun();
      cy.contains('Cloud-init').should('be.visible');

      tab.navigateToMetadata();
      cy.contains('Annotations').should('be.visible');
    });
  });

  describe('Check templates tabs', () => {
    it('visit template page', () => {
      cy.visitTemplates();
    });

    it('common template tabs are loaded', () => {
      cy.switchProject('All Projects');
      cy.get(nameFilter).type(TEMPLATE.RHEL9.metadataName);
      cy.byLegacyTestID(TEMPLATE.RHEL9.metadataName).click();

      cy.contains('Display name').should('be.visible');
      cy.contains('not editable').should('be.visible');

      tab.navigateToYAML();
      cy.contains('Download').should('be.visible');

      tab.navigateToTScheduling();
      cy.contains('Tolerations').should('be.visible');

      tab.navigateToTNetworks();
      cy.contains('Pod networking').should('be.visible');

      tab.navigateToTDisks();
      cy.contains('rootdisk').should('be.visible');

      tab.navigateToTScripts();
      cy.contains('Cloud-init').should('be.visible');

      tab.navigateToTParameters();
      cy.contains('DATA_SOURCE_NAME').should('be.visible');
    });

    it('create example template', () => {
      cy.switchProject('default');
      cy.get(itemCreateBtn).click();
      cy.get(saveBtn).click();
    });

    it('custom template tabs are loaded', () => {
      cy.contains('Display name').should('be.visible');

      tab.navigateToYAML();
      cy.contains('Download').should('be.visible');

      tab.navigateToTScheduling();
      cy.contains('Tolerations').should('be.visible');

      tab.navigateToTNetworks();
      cy.contains('Pod networking').should('be.visible');

      tab.navigateToTDisks();
      cy.contains('rootdisk').should('be.visible');

      tab.navigateToTScripts();
      cy.contains('Cloud-init').should('be.visible');

      tab.navigateToTParameters();
      cy.contains('CLOUD_USER_PASSWORD').should('be.visible');
    });
  });

  describe('Check instanceTypes pages', () => {
    it('instanceTypes is loaded', () => {
      cy.visitITs();
      cy.contains('cx1.2xlarge').should('exist');
    });

    it('create instanceType from yaml on the first tab', () => {
      cy.get('div.co-operator-details__actions').find(itemCreateBtn).click();
      cy.get(saveBtn).click();
      cy.get(breadcrumb).click();
      cy.get(nameFilter).type(Example);
      cy.byLegacyTestID(Example).should('exist');
      cy.byLegacyTestID('cx1.2xlarge').should('not.exist');
    });

    it('create instanceType from yaml on the second tab', () => {
      cy.contains('span.pf-v5-c-tabs__item-text', 'User provided').click();
      cy.get(itemCreateBtn).click();
      cy.get(saveBtn).click();
      cy.get(breadcrumb).click();
      cy.byLegacyTestID(Example).should('exist');
    });
  });

  describe('Check preferences pages', () => {
    it('preferences is loaded', () => {
      cy.visitPreferences();
      cy.contains('fedora').should('exist');
    });

    it('create preference from yaml on the first tab', () => {
      cy.get('div.co-operator-details__actions').find(itemCreateBtn).click();
      cy.get(saveBtn).click();
      cy.get(breadcrumb).click();
      cy.get(nameFilter).type(Example);
      cy.byLegacyTestID(Example).should('exist');
      cy.byLegacyTestID('fedora').should('not.exist');
    });

    it('create preference from yaml on the second tab', () => {
      cy.contains('span.pf-v5-c-tabs__item-text', 'User preferences').click();
      cy.get(itemCreateBtn).click();
      cy.get(saveBtn).click();
      cy.get(breadcrumb).click();
      cy.byLegacyTestID(Example).should('exist');
    });
  });

  describe('Check bootable volume pages', () => {
    it('bootable volume page is loaded', () => {
      cy.visitVolumes();
      cy.switchProject('All Projects');
      cy.contains('fedora').should('exist');
    });

    // TODO: revert after https://issues.redhat.com/browse/CNV-51198
    xit('create bootable volume from yaml', () => {
      cy.get(itemCreateBtn).click();
      cy.byButtonText(WithYAML).click();
      cy.get(saveBtn).click();
      cy.get(breadcrumb).click();
      cy.byLegacyTestID(Example).should('exist');
    });
  });

  describe('Check Migration policy pages', () => {
    it('the migration policy page is loaded', () => {
      cy.visitMPs();
      cy.contains('No MigrationPolicies found').should('exist');
    });

    it('create migration policy from yaml', () => {
      cy.get(itemCreateBtn).click();
      cy.byButtonText(WithYAML).click();
      cy.get(saveBtn).click();
      cy.get('.pf-v5-c-breadcrumb__item').eq(0).click();
      cy.byLegacyTestID(Example).should('exist');
    });
  });

  describe('Check Checkups', () => {
    it('the network checkup pages is loaded', () => {
      cy.visitCheckups();
      cy.contains('No network latency checkups found').should('exist');
    });

    it('the storage checkup pages is loaded', () => {
      cy.contains('span.pf-v5-c-tabs__item-text', 'Storage').click();
      cy.contains('No storage checkups found').should('exist');
    });
  });
});
