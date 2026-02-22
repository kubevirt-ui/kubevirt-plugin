import { ALL_PROJ_NS, MINUTE, SECOND, TEST_NS, VM_STATUS } from '../../utils/const/index';
import { Example, YAML } from '../../utils/const/string';
import { TEMPLATE } from '../../utils/const/template';
import * as sel from '../../views/selector';
import { userButtonTxt } from '../../views/selector-instance';
import { navigateToConfigurationSubTab, subTabName, tab } from '../../views/tab';

describe('Check all virtualization pages can be loaded', () => {
  before(() => {
    cy.beforeSpec();
    cy.visitVMsVirt();
  });

  describe('Check VirtualMachines page', () => {
    it('start example vm', () => {
      cy.byLegacyTestID(Example).click();
      cy.get(sel.iconStartBtn, { timeout: MINUTE }).click();
      cy.wait(15 * SECOND);
    });

    it(
      'check the status of example vm',
      {
        retries: {
          runMode: 8,
        },
      },
      () => {
        cy.contains(sel.vmStatusOnOverview, VM_STATUS.Running).should('be.visible');
        cy.wait(10 * SECOND);
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
      cy.contains('Guest system log').should('be.visible');

      tab.navigateToConfiguration();
      cy.contains('Headless mode').should('be.visible');

      navigateToConfigurationSubTab(subTabName.Storage);
      cy.contains('rootdisk').should('be.visible');

      navigateToConfigurationSubTab(subTabName.Network);
      cy.contains('Pod networking').should('be.visible');

      navigateToConfigurationSubTab(subTabName.Scheduling);
      cy.contains('Scheduling and resource requirements').should('be.visible');

      navigateToConfigurationSubTab(subTabName.SSH);
      cy.contains('SSH access').should('be.visible');

      navigateToConfigurationSubTab(subTabName.InitialRun);
      cy.contains('Cloud-init').should('be.visible');

      navigateToConfigurationSubTab(subTabName.Metadata);
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

  describe('Check Templates page', () => {
    it('visit template page', () => {
      cy.visitTemplates();
      cy.switchProject(ALL_PROJ_NS);
    });

    it('common template tabs are loaded', () => {
      cy.get(sel.nameFilter).type(TEMPLATE.RHEL9.metadataName);
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
      cy.get(sel.itemCreateBtn).click();
      cy.get(sel.saveBtn).click();
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

  describe('Check InstanceTypes tabs', () => {
    it('instanceTypes page is loaded', () => {
      cy.visitITs();
      cy.contains('cx1.2xlarge').should('exist');
    });

    it('create VirtualMachineClusterInstanceType from YAML', () => {
      cy.get('div.co-m-list').find(sel.itemCreateBtn).eq(0).click();
      cy.get(sel.saveBtn).click();
      cy.get(sel.breadcrumb).click();
      cy.get(sel.nameFilter).first().type(Example);
      cy.byLegacyTestID(Example).should('exist');
      cy.byLegacyTestID('cx1.2xlarge').should('not.exist');
    });

    it('create VirtualMachineInstanceType from YAML', () => {
      cy.contains('span.pf-v6-c-tabs__item-text', userButtonTxt).click();
      cy.switchProject(TEST_NS);
      cy.get(sel.itemCreateBtn).click();
      cy.get(sel.saveBtn).click();
      cy.get(sel.breadcrumb).click();
      cy.byLegacyTestID(Example).should('exist');
    });
  });

  describe('Check Bootable volumes page', () => {
    it('bootable volume page is loaded', () => {
      cy.visitVolumes();
      cy.switchProject(ALL_PROJ_NS);
      cy.contains('fedora').should('exist');
    });

    it('create bootable volume from YAML', () => {
      cy.switchProject(TEST_NS);
      cy.wait(3000);
      cy.get(sel.itemCreateBtn).click();
      cy.byButtonText(YAML).click();
      cy.get(sel.saveBtn).click();
      cy.byLegacyTestID(Example).should('exist');
    });
  });

  describe('Check MigrationPolicies page', () => {
    it('migration policy page is loaded', () => {
      cy.visitMPs();
      cy.contains('No MigrationPolicies found').should('exist');
    });

    it('create migration policy from YAML', () => {
      cy.get(sel.itemCreateBtn).click();
      cy.byButtonText(YAML).click();
      cy.get(sel.saveBtn).click();
      cy.get('.pf-v6-c-breadcrumb__item').eq(0).click();
      cy.byLegacyTestID(Example).should('exist');
    });
  });

  describe('Check Checkups tabs', () => {
    it('storage checkup pages is loaded', () => {
      cy.visitCheckups();
      cy.contains('.pf-v6-c-tabs__item-text', 'Storage').click();
      cy.contains('No storage checkups found').should('exist');
    });
  });
});
