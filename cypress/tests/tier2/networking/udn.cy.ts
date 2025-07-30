import { VirtualMachineData } from '../../../types/vm';
import { adminOnlyDescribe, nnsIT, TEST_NS } from '../../../utils/const/index';
import { TEMPLATE } from '../../../utils/const/template';
import { checkActionMenu } from '../../../views/actions';
import { Perspective, switchPerspective } from '../../../views/perspective';
import { brCrumbItem } from '../../../views/selector-template';
import { tab } from '../../../views/tab';
import { vm } from '../../../views/vm-flow';

const testVM: VirtualMachineData = {
  name: 'vm-with-udn',
  namespace: TEST_NS,
  template: TEMPLATE.RHEL9,
};

const testVM1: VirtualMachineData = {
  name: 'vm-with-udn-it',
  namespace: TEST_NS,
  volume: 'rhel9',
};

const subnet = '192.168.1.1/24';
const proName = 'pro-udn';
const displayName = 'pro-display';
const descName = 'pro-desc';
const udnName = 'test-udn';
const L2bridge = 'L2 bridge';
const primaryUdn = 'primary-udn';
const clusterUdn = 'cluster-udn';

adminOnlyDescribe('Test UDN and CUDN', () => {
  before(() => {
    cy.beforeSpec();
  });

  xdescribe('Test UserDefinedNetworks', () => {
    before(() => {
      cy.deleteVMs([testVM, testVM1]);
    });

    after(() => {
      cy.deleteVMs([testVM, testVM1]);
    });

    it('ID(CNV-11867) create UDN', () => {
      cy.visitUDN();
      cy.switchProject(TEST_NS);
      cy.byButtonText('Create').click();
      cy.get('[data-test="list-page-create-dropdown-item-UserDefinedNetwork"]')
        .find('button')
        .click();
      cy.get('input[placeholder="Select a Project"]').click();
      // Project must have 'k8s.ovn.org/primary-user-defined-network' label
      cy.get('input[data-test="input-udn-subnet"]').type(subnet);
      cy.get('button[data-test="create-udn-submit"]').click();
      cy.checkTitle(primaryUdn);
      checkActionMenu('UserDefinedNetwork');
      cy.contains(brCrumbItem, 'UserDefinedNetworks').find('a').eq(0).click();
      cy.contains(primaryUdn).should('exist');
    });

    it('ID(CNV-11868) create VM (template) with UDN', () => {
      vm.create(testVM, false);
      tab.navigateToConfigurationNetwork();
      cy.contains('Masquerade').should('not.exist');
      cy.contains(L2bridge).should('exist');
    });

    it('ID(CNV-11869) create VM (instanceType) with UDN', () => {
      vm.instanceCreate(testVM1, false);
      tab.navigateToConfigurationNetwork();
      cy.contains('Masquerade').should('not.exist');
      cy.contains(L2bridge).should('exist');
    });

    it('ID(CNV-11870) delete UDN', () => {
      cy.visitUDN();
      cy.contains('[data-label="name"]', primaryUdn).find('a').click();
      cy.byButtonText('Actions').click();
      cy.get('[data-test-action="Delete UserDefinedNetwork"]').click();
      cy.get('[data-test="confirm-action"]').click();
      cy.contains(primaryUdn).should('not.exist');
    });

    // the feature is removed in 4.18, not available yet
    xit('create project with udn', () => {
      switchPerspective(Perspective.Administrator);
      cy.get('[data-quickstart-id="qs-nav-home"]').click();
      cy.contains('a[data-test="nav"]', 'Projects').click();
      cy.byButtonText('Create Project').click();
      cy.get('input[name="project.metadata.name"]').type(proName);
      cy.get('input[id="input-display-name"]').type(displayName);
      cy.get('[id="input-description"]').type(descName);
      cy.contains('span.pf-v6-c-tabs__item-text', 'Network').click();
      cy.get('button[id="toggle-network-type"]').click();
      cy.contains('Define a new UserDefinedNetwork for this project').click();
      cy.get('input[data-test="input-udn-name"]').type(udnName);
      cy.get('input[data-test="input-udn-subnet"]').type(subnet);
      cy.get('button[data-test="modal-create-project"]').click();
    });

    it('switch back to Virtualization', () => {
      cy.switchToVirt();
    });
  });

  describe('Test ClusterUserDefinedNetworks', () => {
    before(() => {
      cy.deleteVMs([testVM, testVM1]);
    });

    after(() => {
      cy.deleteVMs([testVM, testVM1]);
    });

    it('ID(CNV-11871) create CUDN', () => {
      cy.visitUDN();
      cy.switchProject(TEST_NS);
      cy.contains('.pf-v6-c-menu-toggle__text', 'Create').click();
      cy.byButtonText('ClusterUserDefinedNetwork').click();
      cy.get('input[data-test="input-name"]').type(clusterUdn);
      cy.get('input[data-test="input-udn-subnet"]').type(subnet);
      cy.get('input[data-test="tags-input"]').type('kubernetes.io/metadata.name=auto-test-ns');
      cy.byButtonText('Review selected project(s)').click();
      cy.get('button[data-test="create-udn-submit"]').click();
      cy.checkTitle(clusterUdn);
      checkActionMenu('ClusterUserDefinedNetwork');
      cy.contains(brCrumbItem, 'ClusterUserDefinedNetworks').find('a').eq(0).click();
    });

    it('ID(CNV-11872) create VM (template) with CUDN', () => {
      vm.create(testVM, false);
      tab.navigateToConfigurationNetwork();
      cy.contains('Masquerade').should('exist');
      cy.contains(L2bridge).should('not.exist');
    });

    it('ID(CNV-11873) create VM (instanceType) with CUDN', () => {
      vm.instanceCreate(testVM1, false);
      tab.navigateToConfigurationNetwork();
      cy.contains('Masquerade').should('exist');
      cy.contains(L2bridge).should('not.exist');
    });

    it('stop VMs', () => {
      cy.patchVM(testVM.name, 'Halted');
      cy.patchVM(testVM1.name, 'Halted');
    });

    it('ID(CNV-11874) delete CUDN', () => {
      cy.visitUDN();
      cy.contains('[data-label="name"]', clusterUdn).find('a').click();
      cy.byButtonText('Actions').click();
      cy.get('[data-test-action="Delete ClusterUserDefinedNetwork"]').click();
      cy.get('[data-test="confirm-action"]').click();
      cy.contains(clusterUdn).should('not.exist');
    });
  });
});
