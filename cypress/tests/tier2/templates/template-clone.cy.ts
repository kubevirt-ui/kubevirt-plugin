import { NIC, TemplateData, VirtualMachineData } from '../../../types/vm';
import { blankDisk, cloneDisk, ephemeralDisk, vmDisks } from '../../../utils/const/diskSource';
import {
  adminOnlyDescribe,
  ALL_PROJ_NS,
  K8S_KIND,
  OCP_NS,
  SECOND,
  TEST_NS,
} from '../../../utils/const/index';
import { NAD_OVN } from '../../../utils/const/nad';
import { dedicatedResources } from '../../../utils/const/string';
import { TEMPLATE } from '../../../utils/const/template';
import * as vmView from '../../../views/selector-common';
import * as tView from '../../../views/selector-template';
import { tab } from '../../../views/tab';
import { editTemplate, template } from '../../../views/template-flow';
import { vm } from '../../../views/vm-flow';

const nic: NIC = {
  model: 'virtio',
  name: 'nic-ovn',
  network: NAD_OVN.name,
};

const sourceTemplate = TEMPLATE.RHEL9;

const cloneTemplate: TemplateData = {
  bootMode: 'BIOS',
  cloudInitPwd: 'testcnv',
  cloudInitUname: 'test-user',
  //cpu: '2',
  dedicatedResources: true,
  //disks: templateDisks,
  evictionStrategy: true,
  //mem: '3',
  metadataName: 'test-clone-template',
  name: 'test-clone-template',
  namespace: TEST_NS,
  provider: 'auto-test',
  workload: 'High performance',
  // newSecret: 'secret-from-template',
};

const cloneTemplateWithNic: TemplateData = {
  metadataName: 'test-clone-template',
  name: 'test-clone-template',
  nics: [nic],
};

// TODO: add existing secret to template
// TODO: add disk via upload

const vmWith2Nic: VirtualMachineData = {
  name: 'vm-2-nic-disk',
  namespace: TEST_NS,
  startOnCreation: false,
  template: cloneTemplate,
  userTemplate: true,
};

const vmFromCloneTemplate: VirtualMachineData = {
  disks: vmDisks,
  name: 'vm-from-clone-template',
  namespace: TEST_NS,
  startOnCreation: true,
  template: cloneTemplate,
  userTemplate: true,
};

adminOnlyDescribe('Test template clone edit template data', () => {
  before(() => {
    cy.deleteVMs([vmFromCloneTemplate, vmWith2Nic]);
    cy.deleteResource(K8S_KIND.Template, cloneTemplate.metadataName, OCP_NS);
    cy.deleteResource(K8S_KIND.Secret, cloneTemplate.newSecret, OCP_NS);
    cy.deleteResource(K8S_KIND.Secret, cloneTemplate.newSecret, TEST_NS);
    cy.beforeSpec();
  });

  after(() => {
    cy.deleteVMs([vmFromCloneTemplate, vmWith2Nic]);
    cy.deleteResource(K8S_KIND.Template, cloneTemplate.metadataName, OCP_NS);
    cy.deleteResource(K8S_KIND.Secret, cloneTemplate.newSecret, OCP_NS);
    cy.deleteResource(K8S_KIND.Secret, cloneTemplate.newSecret, TEST_NS);
  });

  describe('Clone a template', () => {
    it('ID(CNV-8874) clone a template', () => {
      cy.visitTemplates();
      cy.switchProject(ALL_PROJ_NS);
      cy.get(tView.itemFilter).type(sourceTemplate.metadataName);
      template.clone(sourceTemplate.metadataName, cloneTemplate);
    });

    it('ID(CNV-8872) verify the provider of the cloned template', () => {
      cy.contains(vmView.descrText, cloneTemplate.provider).should('exist');
    });

    it('ID(CNV-8876) edit the cloned template', () => {
      editTemplate(cloneTemplate);
    });
  });

  describe('Create VM from the cloned template', () => {
    it('ID(CNV-9546) create VM from the cloned template', () => {
      cy.visitCatalog();
      cy.switchProject(TEST_NS);
      vm.customizeCreate(vmFromCloneTemplate, false);
      // cy.exec(`oc get vm ${vmFromCloneTemplate.name} -o yaml`).then((res) => {
      //   cy.task('log', res.stdout);
      // });
    });

    it('ID(CNV-9546) verify VM details information', () => {
      tab.navigateToConfigurationDetails();
      //cy.get(vmView.cpuMem).should('contain', cloneTemplate.cpu);
      //cy.get(vmView.cpuMem).should('contain', cloneTemplate.mem);
      cy.get(vmView.workload(vmFromCloneTemplate.name)).should('contain', cloneTemplate.workload);
    });

    it('ID(CNV-9546) verify VM scheduling settings', () => {
      tab.navigateToConfigurationScheduling();
      cy.get(tView.dedicatedResEditBtn).should('contain', dedicatedResources);
      //cy.get(tView.liveMigrateEditBtn).should('contain', noEvictionStrategy);
    });

    it('ID(CNV-9546) verify VM disks', () => {
      tab.navigateToConfigurationStorage();
      cy.contains(vmView.row, blankDisk.name).should('exist');
      cy.contains(vmView.row, ephemeralDisk.name).should('exist');
      cy.contains(vmView.row, cloneDisk.name).should('exist');
    });
  });

  describe('Add nic to the cloned template', () => {
    it('ID(CNV-1850) add 2nd nic to the cloned template', () => {
      cy.visitTemplates();
      cy.switchProject(ALL_PROJ_NS);
      cy.get(tView.itemFilter).type(cloneTemplate.metadataName);
      cy.byLegacyTestID(cloneTemplate.metadataName).click();
      editTemplate(cloneTemplateWithNic);
    });

    it('ID(CNV-9791) create VM from the template and verify the 2nd nic is attached', () => {
      cy.visitCatalog();
      cy.switchProject(TEST_NS);
      vm.create(vmWith2Nic, false);
      tab.navigateToConfigurationNetwork();
      cy.contains(nic.network).should('exist');
    });
  });

  describe('Delete the template', () => {
    it('ID(CNV-8882) delete the cloned template', () => {
      cy.visitTemplates();
      cy.switchProject(ALL_PROJ_NS);
      cy.get(tView.itemFilter).type(cloneTemplate.metadataName);
      template.delete(cloneTemplate.metadataName);
      cy.wait(3 * SECOND); // wait for page load
      cy.get(tView.itemFilter).type(cloneTemplate.metadataName);
      cy.get(vmView.emptyMsg).should('exist');
    });
  });
});
