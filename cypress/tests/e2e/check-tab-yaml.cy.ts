import { K8S_KIND, TEST_NS } from '../../utils/const/index';
import { Example, YAML } from '../../utils/const/string';
import { TEMPLATE } from '../../utils/const/template';
import {
  breadcrumb,
  iconStartBtn,
  itemCreateBtn,
  nameFilter,
  vmStatusOnOverview,
} from '../../views/selector';
import { tab } from '../../views/tab';

const cleanupExampleResources = () => {
  for (const ns of [TEST_NS, 'default']) {
    cy.exec(
      `oc delete --ignore-not-found=true -n ${ns} --cascade vm ${Example} vmi ${Example} --wait=true --timeout=180s`,
      { failOnNonZeroExit: false, timeout: 180000 },
    );
    cy.deleteResource(K8S_KIND.Template, Example, ns);
    cy.exec(
      `oc delete --ignore-not-found=true -n ${ns} --cascade VirtualMachineInstancetype ${Example} VirtualMachinePreference ${Example} --wait=true --timeout=180s`,
      { failOnNonZeroExit: false, timeout: 180000 },
    );
  }

  cy.deleteResource(K8S_KIND.VMCI, Example);
  cy.deleteResource(K8S_KIND.VMCP, Example);
  cy.deleteResource(K8S_KIND.MP, Example);
};

const clickCreate = () => {
  cy.get(itemCreateBtn).first().should('be.visible').click();
};

const clickTab = (label: string) => {
  cy.contains('[role="tab"]', label).should('be.visible').click();
};

describe('Check all virtualization pages can be loaded', () => {
  before(() => {
    cy.visit('');
    cy.newProject(TEST_NS);
    cleanupExampleResources();
    cy.switchProject(TEST_NS);
  });

  after(() => {
    cleanupExampleResources();
  });

  describe('Check VM tabs', () => {
    it('visit VM list page', () => {
      cy.visitVMs();
      cy.switchProject(TEST_NS);
    });

    it('create example VM', () => {
      cy.get(itemCreateBtn).click();
      cy.byButtonText(YAML).click();
      cy.saveYAML();
    });

    it('start example vm', () => {
      cy.get(iconStartBtn).click();
      cy.wait(15000);
    });

    it(
      'check the status of example vm',
      {
        retries: {
          runMode: 8,
        },
      },
      () => {
        cy.contains(vmStatusOnOverview, 'Running').should('be.visible');
        cy.wait(10000);
      },
    );

    it('vm tabs are loaded', () => {
      cy.contains('Hostname').should('be.visible');

      tab.navigateToMetrics();
      cy.contains('Utilization').should('be.visible');

      tab.navigateToYAML();
      cy.contains('Download').should('be.visible');

      tab.navigateToEvents();
      cy.contains('event').should('be.visible');

      tab.navigateToConsole();
      cy.contains('Guest login credentials').should('be.visible');

      tab.navigateToSnapshots();
      cy.contains('No snapshots found').should('be.visible');

      tab.navigateToDiagnostics();
      cy.contains('Status conditions').should('be.visible');

      tab.navigateToDiagnosticsGuestSystemLog();
      cy.contains('Guest system logs').should('be.visible');

      // sub-tabs in configuration tab
      tab.navigateToConfiguration();
      cy.contains('Machine type').should('be.visible');
      cy.contains('Headless mode').should('be.visible');

      tab.navigateToConfigurationStorage();
      cy.contains('rootdisk').should('be.visible');

      tab.navigateToConfigurationNetwork();
      cy.contains('Pod networking').should('be.visible');

      tab.navigateToConfigurationScheduling();
      cy.contains('Scheduling and resource requirements').should('be.visible');

      tab.navigateToConfigurationSSH();
      cy.contains('SSH access').should('be.visible');

      tab.navigateToConfigurationInitialRun();
      cy.contains('Cloud-init').should('be.visible');

      tab.navigateToConfigurationMetadata();
      cy.contains('Annotations').should('be.visible');
    });

    it('vmi tabs are loaded', () => {
      tab.navigateToOverview();
      cy.contains('VirtualMachineInstance').should('be.visible');
      cy.byLegacyTestID(Example).click();

      cy.contains('Annotations').should('be.visible');

      tab.navigateToYAML();
      cy.contains('Download').should('be.visible');

      tab.navigateToScheduling();
      cy.contains('Tolerations').should('be.visible');

      tab.navigateToEvents();
      cy.contains('event').should('be.visible');

      tab.navigateToConsole();
      cy.contains('Guest login credentials').should('be.visible');

      tab.navigateToNetworks();
      cy.contains('Pod networking').should('be.visible');

      tab.navigateToDisks();
      cy.contains('rootdisk').should('be.visible');
    });
  });

  describe('Check Templates tabs', () => {
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

      tab.navigateToScheduling();
      cy.contains('Tolerations').should('be.visible');

      tab.navigateToNetworks();
      cy.contains('Pod networking').should('be.visible');

      tab.navigateToDisks();
      cy.contains('rootdisk').should('be.visible');

      tab.navigateToScripts();
      cy.contains('Cloud-init').should('be.visible');

      tab.navigateToParameters();
      cy.contains('DATA_SOURCE_NAME').should('be.visible');
    });

    it('create example template', () => {
      cy.switchProject(TEST_NS);
      cy.get(itemCreateBtn).click();
      cy.saveYAML();
    });

    it('custom template tabs are loaded', () => {
      cy.contains('Display name').should('be.visible');

      tab.navigateToYAML();
      cy.contains('Download').should('be.visible');

      tab.navigateToScheduling();
      cy.contains('Tolerations').should('be.visible');

      tab.navigateToNetworks();
      cy.contains('Pod networking').should('be.visible');

      tab.navigateToDisks();
      cy.contains('rootdisk').should('be.visible');

      tab.navigateToScripts();
      cy.contains('Cloud-init').should('be.visible');

      tab.navigateToParameters();
      cy.contains('CLOUD_USER_PASSWORD').should('be.visible');
    });
  });

  describe('Check InstanceTypes pages', () => {
    it('instanceTypes is loaded', () => {
      cy.visitITs();
      cy.contains('cx1.2xlarge').should('exist');
    });

    it('create instanceType from yaml on the first tab', () => {
      cy.deleteResource(K8S_KIND.VMCI, Example);
      cy.visitITs();
      clickCreate();
      cy.saveYAML();
      cy.get(breadcrumb).first().click();
      cy.get(nameFilter).should('be.visible').clear().type(Example);
      cy.byLegacyTestID(Example).should('exist');
      cy.byLegacyTestID('cx1.2xlarge').should('not.exist');
      // Clear filter so visitITs() in the next test can see cluster defaults.
      cy.get(nameFilter).clear();
    });

    it('create instanceType from yaml on the second tab', () => {
      for (const ns of [TEST_NS, 'default']) {
        cy.exec(
          `oc delete --ignore-not-found=true -n ${ns} --cascade VirtualMachineInstancetype ${Example} --wait=true --timeout=180s`,
          { failOnNonZeroExit: false, timeout: 180000 },
        );
      }
      cy.visitITs();
      clickTab('User provided');
      clickCreate();
      cy.saveYAML();
      cy.get(breadcrumb).first().click();
      cy.byLegacyTestID(Example).should('exist');
    });
  });

  describe('Check Preferences pages', () => {
    it('preferences is loaded', () => {
      cy.visitPreferences();
      cy.contains('fedora').should('exist');
    });

    it('create preference from yaml on the first tab', () => {
      cy.deleteResource(K8S_KIND.VMCP, Example);
      cy.visitPreferences();
      clickCreate();
      cy.saveYAML();
      cy.get(breadcrumb).first().click();
      cy.get(nameFilter).should('be.visible').clear().type(Example);
      cy.byLegacyTestID(Example).should('exist');
      cy.byLegacyTestID('fedora').should('not.exist');
      cy.get(nameFilter).clear();
    });

    it('create preference from yaml on the second tab', () => {
      for (const ns of [TEST_NS, 'default']) {
        cy.exec(
          `oc delete --ignore-not-found=true -n ${ns} --cascade VirtualMachinePreference ${Example} --wait=true --timeout=180s`,
          { failOnNonZeroExit: false, timeout: 180000 },
        );
      }
      cy.visitPreferences();
      clickTab('User preferences');
      clickCreate();
      cy.saveYAML();
      cy.get(breadcrumb).first().click();
      cy.byLegacyTestID(Example).should('exist');
    });
  });

  describe('Check BootVolume pages', () => {
    it('bootable volume page is loaded', () => {
      cy.visitVolumes();
      cy.switchProject('All Projects');
      cy.contains('fedora').should('exist');
    });

    xit('create bootable volume from yaml', () => {
      cy.get(itemCreateBtn).click();
      cy.byButtonText(YAML).click();
      cy.saveYAML();
      cy.get(breadcrumb).first().click();
      cy.byLegacyTestID(Example).should('exist');
    });
  });

  describe('Check MigrationPolicies pages', () => {
    it('the migration policy page is loaded', () => {
      cy.visitMPs();
      cy.contains('No MigrationPolicies found').should('exist');
    });

    it('create migration policy from yaml', () => {
      cy.get(itemCreateBtn).click();
      cy.byButtonText(YAML).click();
      cy.saveYAML();
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
