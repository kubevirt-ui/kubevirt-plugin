import { K8S_KIND, TEST_NS } from '../utils/const/index';
import { tab } from '../views/tab';
import { vm } from '../views/vm';

// Ported from release-4.18's check-tab-yaml.cy.ts.
//
// Hot-cluster runner RBAC: VM delete is cluster-wide (arc-runner-ci), but
// Template delete is only granted via the namespaced ci-env-test-runner
// RoleBinding in the test namespace. `oc delete template -n default` therefore
// returns Forbidden and, with failOnNonZeroExit:false, silently leaves the
// leftover that blocks Create-from-YAML ("example already exists"). Clear
// Templates through the auth-disabled console proxy (cluster-admin SA) so
// default leftovers are removable, and create new templates in TEST_NS.
const cleanupExampleResources = () => {
  for (const ns of ['default', TEST_NS]) {
    cy.exec(
      `oc delete --ignore-not-found=true -n ${ns} --cascade vm example vmi example --wait=true --timeout=180s`,
      { failOnNonZeroExit: false, timeout: 180000 },
    );
    cy.deleteResource(K8S_KIND.TEMPLATE, 'example', ns);
    cy.exec(`oc delete template example -n ${ns} --ignore-not-found=true --wait=true`, {
      failOnNonZeroExit: false,
      timeout: 60000,
    });
    // Console proxy has cluster-admin; runner SA does not for Templates in default.
    cy.request({
      failOnStatusCode: false,
      method: 'DELETE',
      url: `/api/kubernetes/apis/template.openshift.io/v1/namespaces/${ns}/templates/example`,
    });
  }
};

describe('Check all virtualization pages can be loaded', () => {
  before(() => {
    cy.login();
    cleanupExampleResources();
  });

  after(() => {
    cleanupExampleResources();
  });

  describe('Check VM list and tabs', () => {
    it('create example VM', () => {
      cy.visitVMs();
      vm.createVMFromYAML();
      cy.contains('Hostname').should('be.visible');
    });

    it('vm tabs are loaded', () => {
      tab.navigateToMetrics();
      cy.contains('Utilization').should('be.visible');

      tab.navigateToYAML();
      cy.contains('Download').should('be.visible');

      tab.navigateToEvents();
      cy.contains('event').should('be.visible');

      tab.navigateToConsole();
      cy.contains('This VirtualMachine is down').should('be.visible');

      tab.navigateToSnapshots();
      cy.contains('Take snapshot').should('be.visible');

      tab.navigateToDiagnostics();
      cy.contains('Message').should('be.visible');
    });
  });

  describe('Check templates tabs', () => {
    it('common template tabs are loaded', () => {
      cy.visitTemplates();
      cy.switchProject('All Projects');
      // CentOS 7 common templates are no longer shipped; use a current common template.
      cy.contains('centos-stream9-server-small').click();

      cy.contains('Display name').should('be.visible');
      cy.byTestID('common-template-alert').should('be.visible');

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
      // Cypress retries re-run the test but not the suite before(); clean up so a
      // prior attempt's "example" template does not make Create-from-YAML fail
      // with "already exists". Create in TEST_NS (not All Projects → default):
      // runner SA can only delete Templates in the test namespace.
      cleanupExampleResources();
      cy.visitTemplates();
      cy.switchProject(TEST_NS);
      cy.get('[data-test="item-create"]').click();
      cy.saveYAML();

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

      tab.navigateToParameters();
      cy.contains('CLOUD_USER_PASSWORD').should('be.visible');
    });
  });
});
