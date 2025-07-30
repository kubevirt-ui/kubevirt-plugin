import { VirtualMachineData } from '../../../types/vm';
import {
  adminOnlyDescribe,
  ALL_PROJ_NS,
  DEFAULT_VM_NAME,
  K8S_KIND,
  SECOND,
  TEST_NS,
} from '../../../utils/const/index';
import { TEMPLATE } from '../../../utils/const/template';
import { tabModal } from '../../../views/actions';
import { labelContent, labelGroup, treeNode } from '../../../views/selector-common';
import { vmDetailFolder, vmFolder } from '../../../views/selector-instance';
import { tab } from '../../../views/tab';
import { vm } from '../../../views/vm-flow';

const TEST_FOLDER = 'test-folder';
const OTHER_FOLDER = 'other-folder';
const TEST_LABEL = 'test-label=true';
const EMPTY_NS = 'empty-project';

const VM_TEMPLATE_FOLDER: VirtualMachineData = {
  folder: TEST_FOLDER,
  name: 'vm-template-folder',
  namespace: TEST_NS,
  startOnCreation: false,
  template: TEMPLATE.FEDORA,
};

const VM_IT_FOLDER: VirtualMachineData = {
  folder: TEST_FOLDER,
  name: 'vm-it-folder',
  namespace: TEST_NS,
  startOnCreation: false,
  volume: 'centos-stream10',
};

adminOnlyDescribe('Test VM tree view and folders management', () => {
  before(() => {
    cy.deleteVMs([VM_IT_FOLDER, VM_TEMPLATE_FOLDER]);
    cy.deleteResource(K8S_KIND.Project, EMPTY_NS);
    cy.beforeSpec();
  });

  after(() => {
    cy.deleteVMs([VM_IT_FOLDER, VM_TEMPLATE_FOLDER]);
    cy.deleteResource(K8S_KIND.Project, EMPTY_NS);
  });

  it(
    'visit vm list page',
    {
      retries: {
        openMode: 8,
        runMode: 8,
      },
    },
    () => {
      cy.visitVMs();
    },
  );

  it('ID(CNV-11751) test treeview drawer', () => {
    cy.get('button.vms-tree-view__panel-toggle-button').click();
    cy.get('.pf-v6-c-tree-view').should('not.exist');
    cy.get('button.vms-tree-view__panel-toggle-button').click();
    cy.get('.pf-v6-c-tree-view').should('exist');
  });

  it('create empty project', () => {
    cy.byButtonText('Create Project').click();
    cy.get(tabModal).within(() => {
      cy.checkTitle('Create project');
      cy.get('#project-name').clear().type(EMPTY_NS);
      cy.byButtonText('Create').click();
    });
    cy.get('[data-test-id="vm-list-summary"]').should('be.visible');
    cy.wait(5 * SECOND);
    cy.get('.pf-v6-c-content--h3.vm-list-summary__expand-section-toggle').click();
    cy.get('[data-test-id="vm-list-summary"]').should('not.be.visible');
  });

  it('ID(CNV-11757) test hiding summary', () => {
    cy.get('.pf-v6-c-content--h3.vm-list-summary__expand-section-toggle').click();
    cy.get('[data-test-id="vm-list-summary"]').should('be.visible');
  });

  it('ID(CNV-11753) test empty projects display', () => {
    cy.get('.vms-tree-view__toolbar-switch').find(':checkbox').uncheck({ force: true });
    cy.contains(treeNode, EMPTY_NS).should('exist');
    cy.contains('No VirtualMachines found').should('exist');
  });

  it('ID(CNV-11752) test switching to another project', () => {
    cy.contains(treeNode, TEST_NS).click();
    cy.contains('No VirtualMachines found').should('not.exist');
  });

  it('ID(CNV-11754) create InstanceType VM in new folder', () => {
    cy.contains(treeNode, TEST_NS).click();
    vm.instanceCreate(VM_IT_FOLDER);
    cy.contains(vmDetailFolder, TEST_FOLDER).should('exist');
  });

  it('ID(CNV-11755) create Template VM in existing folder', () => {
    vm.create(VM_TEMPLATE_FOLDER);
    cy.contains(vmDetailFolder, TEST_FOLDER).should('exist');
  });

  it('ID(CNV-11756) test moving VM to other folder', () => {
    cy.contains(treeNode, TEST_NS).click();
    cy.byLegacyTestID(DEFAULT_VM_NAME).click();
    cy.checkTitle(DEFAULT_VM_NAME);
    cy.byButtonText('Actions').click();
    cy.byButtonText('Move to folder').click();
    cy.checkTitle('Move to folder');
    cy.get(vmFolder).clear();
    cy.get(vmFolder).type(TEST_FOLDER);
    cy.contains('.pf-v6-c-menu__item-text', TEST_FOLDER).click();
    cy.clickSaveBtn();
    cy.contains(vmDetailFolder, TEST_FOLDER).should('exist');
  });

  it('ID(CNV-11900) test select all VMs', () => {
    cy.contains(treeNode, TEST_NS).click();
    cy.wait(5 * SECOND);
    cy.get('[aria-label="Bulk select toggle"]').click();
    cy.byButtonText('Select all').click();
    cy.get('td[data-label]').find(':checkbox').should('be.checked');
  });

  it('ID(CNV-11901) test moving multiple VMs to other folder', () => {
    cy.byButtonText('Actions').click();
    cy.get('[data-test-id="selected-vms-action-move-to-folder"]').find('button').click();
    cy.checkTitle('Move to folder');
    cy.get(vmFolder).clear();
    cy.get(vmFolder).type(OTHER_FOLDER);
    cy.contains('.pf-v6-c-menu__item-text', OTHER_FOLDER).click();
    cy.clickSaveBtn();
    cy.contains(treeNode, OTHER_FOLDER).should('exist');
    cy.contains(treeNode, OTHER_FOLDER).click();
    cy.contains(labelGroup, 'Labels').within(() => {
      cy.contains(labelContent, `vm.openshift.io/folder=${OTHER_FOLDER}`).should('exist');
    });
    cy.contains(treeNode, TEST_NS).click();
    cy.byButtonText('Actions').click();
    cy.get('[data-test-id="selected-vms-action-move-to-folder"]').find('button').click();
    cy.checkTitle('Move to folder');
    cy.clickSaveBtn();
    cy.contains(treeNode, OTHER_FOLDER).should('not.exist');
  });

  // the test cannot pass
  xit('ID(CNV-11902) test adding labels to multiple VMs', () => {
    cy.contains(treeNode, TEST_NS).click();
    // cy.get('[aria-label="Bulk select toggle"]').click();
    // cy.byButtonText('Select all').click();
    cy.byButtonText('Actions').click();
    cy.get('[data-test-id="selected-vms-action-edit-labels"]').find('button').click();
    cy.checkTitle('Edit labels');
    cy.get('[data-test="tags-input"]').type(`${TEST_LABEL}{enter}`);
    cy.wait(2 * SECOND);
    cy.clickSaveBtn();
    cy.byLegacyTestID(DEFAULT_VM_NAME).click();
    tab.navigateToMetadata();
    cy.contains(labelContent, TEST_LABEL).should('exist');
    cy.contains(treeNode, VM_TEMPLATE_FOLDER.name).click();
    tab.navigateToMetadata();
    cy.contains(labelContent, TEST_LABEL).should('exist');
  });

  it('ID(CNV-11903) test multiple VMs deletion count', () => {
    // cy.contains(treeNode, TEST_NS).click();
    cy.contains('.pf-v6-c-tree-view__node', TEST_NS)
      .find('.pf-v6-c-tree-view__node-count')
      .then(($cnt) => {
        const count = $cnt.text();
        cy.byButtonText('Actions').click();
        cy.get('[data-test-id="selected-vms-action-delete"]').find('button').click();
        cy.checkTitle(`Delete ${count} VirtualMachines?`);
        cy.byButtonText('Cancel').click();
      });
  });
});
