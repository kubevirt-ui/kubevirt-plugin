import { K8S_KIND } from '../utils/const/index';
import { tab } from '../views/tab';
import { vm } from '../views/vm';

describe('Check all virtualization pages can be loaded', () => {
  before(() => {
    cy.login();
    cy.deleteResource(K8S_KIND.VM, 'vm-example', 'default');
    cy.deleteResource(K8S_KIND.TEMPLATE, 'vm-template-example', 'default');
  });

  after(() => {
    cy.deleteResource(K8S_KIND.VM, 'vm-example', 'default');
    cy.deleteResource(K8S_KIND.TEMPLATE, 'vm-template-example', 'default');
  });

  describe('Check VM list and tabs', () => {
    it('create vm-example', () => {
      cy.visitVMs();
      vm.createVMFromYAML();
      cy.contains('Hostname').should('be.visible');
    });

    it('vm tabs are loaded', () => {
      tab.navigateToDetails();
      cy.contains('VirtualMachine Details').should('be.visible');

      tab.navigateToMetrics();
      cy.contains('Utilization').should('be.visible');

      tab.navigateToYAML();
      cy.contains('Download').should('be.visible');

      tab.navigateToScheduling();
      cy.contains('Scheduling and resources requirements').should('be.visible');

      tab.navigateToEnvironment();
      cy.contains('Include all values').should('be.visible');

      tab.navigateToEvents();
      cy.contains('event').should('be.visible');

      tab.navigateToConsole();
      cy.contains('This VirtualMachine is down').should('be.visible');

      tab.navigateToNetworks();
      cy.contains('Pod networking').should('be.visible');

      tab.navigateToDisks();
      cy.contains('rootdisk').should('be.visible');

      tab.navigateToScripts();
      cy.contains('Cloud-init').should('be.visible');

      tab.navigateToSnapshots();
      cy.contains('Take snapshot').should('be.visible');

      tab.navigateToDiagnostic();
      cy.contains('Message').should('be.visible');
    });
  });

  describe('Check templates tabs', () => {
    it('common template tabs are loaded', () => {
      cy.visitTemplates();
      cy.switchProject('All Projects');
      cy.contains('centos7-desktop-large').click();

      cy.contains('Display name').should('be.visible');
      cy.contains('Templates provided by KubeVirt are not editable').should('be.visible');

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

      tab.navigateToParameters();
      cy.contains('DATA_SOURCE_NAME').should('be.visible');
    });

    it('custom template tabs are loaded', () => {
      cy.visitTemplates();
      cy.switchProject('All Projects');
      cy.get('[data-test="item-create"]').click();
      cy.get('[data-test="save-changes"]').click();

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
});
