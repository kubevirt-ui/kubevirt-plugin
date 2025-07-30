import { TemplateData, VirtualMachineData } from '../../types/vm';
import { DiskSource } from '../../utils/const/diskSource';
import {
  adminOnlyDescribe,
  ALL_PROJ_NS,
  K8S_KIND,
  TEST_NS,
  TEST_SECRET_NAME,
  VM_STATUS,
} from '../../utils/const/index';
import { authSSHKey, linuxOnly, pending, sysPrep, windowsOnly } from '../../utils/const/string';
import { TEMPLATE } from '../../utils/const/template';
import { action } from '../../views/actions';
import { Perspective, switchPerspective } from '../../views/perspective';
import * as cView from '../../views/selector-catalog';
import * as vmView from '../../views/selector-common';
import { itemFilter } from '../../views/selector-template';
import { tab } from '../../views/tab';
import { template } from '../../views/template-flow';
import { vm, waitForStatus } from '../../views/vm-flow';

export const sysprepFile = '../../fixtures/sysprep.xml';

const exampleCloneTemplate: TemplateData = {
  existSecret: TEST_SECRET_NAME,
  metadataName: 'test-example-clone-template',
  name: 'test-example-clone-template',
  namespace: TEST_NS,
  password: 'set-own-pwd',
  provider: 'CNV QE',
  username: 'cnv-tester',
};

export const VM_SCRIPTS: VirtualMachineData = {
  diskSource: DiskSource.Default,
  name: 'vm-script-data',
  namespace: TEST_NS,
  startOnCreation: false,
  template: exampleCloneTemplate,
};

export const VM_CLOUDINIT: VirtualMachineData = {
  diskSource: DiskSource.URL_WIN12,
  password: 'set-new-pwd',
  template: TEMPLATE.WIN2K12R2,
  username: 'tester-cnv',
};

export const VM_SYSPREP_FILE: VirtualMachineData = {
  diskSource: DiskSource.URL_WIN12,
  name: 'vm-new-sysprep',
  namespace: TEST_NS,
  startOnCreation: true,
  sysprepFile: sysprepFile,
  template: TEMPLATE.WIN2K12R2,
};

export const VM_SYSPREP_NAME: VirtualMachineData = {
  diskSource: DiskSource.URL_WIN12,
  name: 'vm-existing-sysprep',
  namespace: TEST_NS,
  startOnCreation: true,
  sysprepName: VM_SYSPREP_FILE.name,
  template: TEMPLATE.WIN2K12R2,
};

export const VM_SECRET: VirtualMachineData = {
  diskSource: DiskSource.Default,
  existSecret: TEST_SECRET_NAME,
  name: 'vm-existing-secret',
  namespace: TEST_NS,
  startOnCreation: true,
  template: TEMPLATE.CENTOSSTREAM9,
};

export const verifyCloudinitInYAML = (username: string, password: string) => {
  tab.navigateToYAML();
  cy.get(vmView.yamlEditor).click().type(`{ctrl}f`);
  cy.get(vmView.yamlEditor).click().type(`{ctrl}f`);
  cy.get('[aria-label="Find"]').type(`user: `);
  cy.get('div.view-line').contains(`user: ${username}`).should('exist');
  cy.get('div.view-line').contains(`password: ${password}`).should('exist');
};

adminOnlyDescribe('Test VM Scripts page', () => {
  before(() => {
    cy.visit('');
    cy.switchToVirt();
  });

  after(() => {
    cy.deleteVM([VM_SYSPREP_FILE, VM_SYSPREP_NAME, VM_SECRET, VM_SCRIPTS]);
    cy.deleteResource(K8S_KIND.Template, exampleCloneTemplate.name, TEST_NS);
  });

  it('test setup', () => {
    cy.visitTemplates();
    cy.switchProject(ALL_PROJ_NS);
    cy.get(itemFilter).type(TEMPLATE.CENTOSSTREAM9.metadataName);
    template.clone(TEMPLATE.CENTOSSTREAM9.metadataName, exampleCloneTemplate);
    cy.visitTemplates();
    cy.get(itemFilter).type(exampleCloneTemplate.metadataName);
    cy.byLegacyTestID(exampleCloneTemplate.metadataName).click();
    template.editScripts(exampleCloneTemplate);
    vm.customizeCreate(VM_SCRIPTS);
    action.start(VM_SCRIPTS.name, false);
  });

  it('ID(CNV-) Check catalog scripts OS labels', () => {
    cy.visitCatalog();
    cy.get(cView.templateTab).click();
    cy.contains(cView.vmCatalog, exampleCloneTemplate.metadataName).click();
    cy.get(cView.customizeVMBtn).click();
    tab.navigateToTScripts();
    cy.contains(vmView.descrGroup, authSSHKey).within(() => {
      cy.get(vmView.osLabel).should('contain.text', linuxOnly);
    });
    cy.contains(vmView.descrGroup, sysPrep).within(() => {
      cy.get(vmView.osLabel).should('contain.text', windowsOnly);
    });
  });

  it('ID(CNV-8956) Check that data on scripts tab is from template', () => {
    cy.visit(`/k8s/ns/${TEST_NS}/kubevirt.io~v1~VirtualMachine/${VM_SCRIPTS.name}`);
    verifyCloudinitInYAML(exampleCloneTemplate.username, exampleCloneTemplate.password);
    tab.navigateToConfigurationInitialRun();
    cy.get(vmView.vmCloudInitEdit).click();
    cy.get(vmView.vmCloudInitUser).should('have.value', exampleCloneTemplate.username);
    cy.get(vmView.vmCloudInitPwd).should('have.value', exampleCloneTemplate.password);
    cy.clickCancelBtn();
    tab.navigateToConfigurationSSH();
    cy.contains(authSSHKey).click();
    cy.contains(TEST_SECRET_NAME).should('exist');
  });

  it('ID(CNV-8957) Check that cloud-init data of VM is updated', () => {
    waitForStatus(VM_SCRIPTS.name, VM_STATUS.Running, false);
    tab.navigateToConfigurationInitialRun();
    cy.wait(8000);
    cy.get(vmView.vmCloudInitEdit).click();
    cy.get(vmView.vmCloudInitUser).clear().type(VM_CLOUDINIT.username);
    cy.get(vmView.vmCloudInitPwd).clear().type(VM_CLOUDINIT.password);
    cy.clickApplyBtn();
    cy.contains(pending).should('exist');
    verifyCloudinitInYAML(VM_CLOUDINIT.username, VM_CLOUDINIT.password);
    action.restart(VM_SCRIPTS.name, false);
    tab.navigateToOverview();
    // waitForStatus(VM_SCRIPTS.name, VM_STATUS.Stopped, false);
    // waitForStatus(VM_SCRIPTS.name, VM_STATUS.Starting, false);
    cy.wait(60000);
    tab.navigateToConsole();
    waitForStatus(VM_SCRIPTS.name, VM_STATUS.Running, false);
    cy.get('.cloud-init-credentials').within(() => {
      cy.byButtonText('Guest login credentials').click();
      cy.contains('.pf-v6-c-clipboard-copy__text', VM_CLOUDINIT.username).should('be.visible');
      cy.contains('.pf-v6-c-clipboard-copy__text', VM_CLOUDINIT.password).should('be.visible');
    });
  });

  it('ID(CNV-8958) Check that ssh key is stored in secret', () => {
    cy.clickNavLink(['Workloads', 'Secrets']);
    cy.get(itemFilter).clear().type(VM_SCRIPTS.name);
    cy.contains(VM_SCRIPTS.name).should('exist');
  });

  it('ID(CNV-9753) Check that existing secret is attached', () => {
    vm.customizeCreate(VM_SECRET, false);
    tab.navigateToConfigurationSSH();
    cy.contains(authSSHKey).click();
    cy.contains(VM_SECRET.existSecret).should('exist');
  });

  it('ID(CNV-9983) Check that existing secret is not deleted with VM', () => {
    action.delete(VM_SECRET.name, false);
    cy.visitCatalog();
    switchPerspective(Perspective.Administrator);
    cy.visitSecrets();
    cy.contains(TEST_SECRET_NAME).should('exist');
    switchPerspective(Perspective.Virtualization);
  });

  it('ID(CNV-9752) Check that sysprep is stored in ConfigMap', () => {
    vm.customizeCreate(VM_SYSPREP_FILE, false);
    tab.navigateToConfigurationStorage();
    cy.contains(vmView.row, 'sysprep').should('exist');
    cy.clickNavLink(['Workloads', 'ConfigMaps']);
    cy.contains(VM_SYSPREP_FILE.name).should('exist');
  });

  it('ID(CNV-9759) Check that existing sysprep is attached', () => {
    vm.customizeCreate(VM_SYSPREP_NAME, false);
    tab.navigateToConfigurationStorage();
    cy.contains(vmView.row, 'sysprep').should('exist');
  });
});
