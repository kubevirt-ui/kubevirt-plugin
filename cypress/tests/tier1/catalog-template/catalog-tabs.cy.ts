import { VirtualMachineData } from '../../../types/vm';
import { DiskSource } from '../../../utils/const/diskSource';
import { K8S_KIND, TEST_NS, TEST_SECRET_NAME } from '../../../utils/const/index';
import { authSSHKey, dedicatedResources, machineType } from '../../../utils/const/string';
import { TEMPLATE } from '../../../utils/const/template';
import { fillReviewAndCreate } from '../../../views/catalog-flow';
import * as cView from '../../../views/selector-catalog';
import * as vmView from '../../../views/selector-common';
import { tab } from '../../../views/tab';
import { vm } from '../../../views/vm-flow';

const testVM: VirtualMachineData = {
  bootMode: 'UEFI',
  cpu: '2',
  // descheduler: true,
  dedicatedResources: true,
  description: 'rhel9 vm',
  diskSource: DiskSource.URL,
  evictionStrategy: false,
  headless: true,
  hostname: 'vm-url-new-secret',
  // addEnvDisk: true,
  labels: ['cnv-qe', 'testing=labels'],
  mem: '3',
  name: 'vm-url-new-secret',
  namespace: TEST_NS,
  newSecret: 'test-secret', // use string here for simplicity
  startOnCreation: true,
  template: TEMPLATE.RHEL9,
  username: 'test-user',
  workload: 'High performance',
};

const testVM1: VirtualMachineData = {
  bootMode: 'BIOS',
  diskSource: DiskSource.Registry,
  name: 'vm-registry-exist-secret',
  namespace: TEST_NS,
  template: TEMPLATE.FEDORA,
};

describe('Customize VirtualMachine', () => {
  before(() => {
    cy.visit('');
    cy.deleteVM([testVM, testVM1]);
    cy.deleteResource(K8S_KIND.Secret, testVM.newSecret, TEST_NS);
    cy.switchToVirt();
    cy.visitCatalog();
  });

  after(() => {
    cy.deleteVM([testVM, testVM1]);
    cy.deleteResource(K8S_KIND.Secret, testVM.newSecret, TEST_NS);
  });

  describe('Verify restore template settings', () => {
    it('ID(CNV-8853) restore CPU/MEM to template default settings', () => {
      cy.get(cView.templateTab).click();
      cy.contains(cView.vmCatalog, testVM.template.metadataName).click();
      fillReviewAndCreate(testVM);
      cy.get(cView.customizeVMBtn).click();
      // cy.get(cView.customizeVMSubmitBtn).click();
      cy.contains(machineType).should('exist');
      cy.get(cView.cpuEditBtn).click();
      cy.get('input[name="cpu-input"]').clear().type('3');
      cy.get('input[name="memory-input"]').clear().type('3');
      cy.clickSaveBtn();

      cy.get(cView.cpuEditBtn).click();
      cy.byButtonText(cView.restoreSetting).click();
      cy.clickSaveBtn();
      cy.get('[data-test-id="wizard-overview-cpu-memory-edit"]').should('contain', '1');
      cy.get('[data-test-id="wizard-overview-cpu-memory-edit"]').should('contain', '2');
      cy.clickCancelBtn();
    });

    it('ID(CNV-8853) restore to first tab', () => {
      cy.get(cView.instanceTab).click();
    });
  });

  describe('Create VM from URL with new secret', () => {
    it('ID(CNV-8850) Create test VM', () => {
      vm.customizeCreate(testVM, false);
    });

    it('ID(CNV-8847) verify VM details tab', () => {
      tab.navigateToConfigurationDetails();
      cy.get(vmView.desc(testVM.name)).should('contain', testVM.description);
      cy.get(vmView.bootMode(testVM.name)).should('contain', testVM.bootMode);
      cy.get(vmView.workload(testVM.name)).should('contain', testVM.workload);
      cy.get(vmView.cpuMem).should('contain', testVM.cpu);
      cy.get(vmView.cpuMem).should('contain', testVM.mem);
      cy.get('#headless-mode').should('be.checked');
      cy.get(vmView.hostname(testVM.name)).should('contain', testVM.hostname);
    });

    it('go to Overview tab', () => {
      tab.navigateToOverview();
    });

    xit(
      'ID(CNV-8850) verify VM is up by checking its OS field',
      {
        retries: {
          openMode: 0,
          runMode: 15,
        },
      },
      () => {
        cy.get(vmView.os).should('contain', 'Red Hat Enterprise Linux');
      },
    );

    xit('ID(CNV-8649) verify VM descheduler setting', () => {
      tab.navigateToConfigurationScheduling();
      cy.get(vmView.descheduler).contains('ON').should('exist');
      cy.exec(
        `oc get -n ${testVM.namespace} vm ${testVM.name} -o jsonpath='{.spec.template.metadata.annotations}'`,
      ).then((result) => {
        expect(result.stdout).contain('"descheduler.alpha.kubernetes.io/evict":"true"');
      });
    });

    it('ID(CNV-8959) verify VM dedicated resources is checked', () => {
      tab.navigateToConfigurationScheduling();
      cy.contains(dedicatedResources).should('exist');
    });

    it('ID(CNV-8960) verify VM eviction strategy is unchecked', () => {
      cy.contains('[data-test-id="eviction-strategy"]', 'None').should('exist');
    });

    xit('ID(CNV-8837) verify VM environment disks', () => {
      tab.navigateToConfigurationStorage();
      cy.contains('.pf-v6-c-label__content', 'environment disk').should('be.visible');
    });

    it('ID(CNV-4022) verify the new secret presents on the SSH tab', () => {
      tab.navigateToConfigurationSSH();
      cy.contains(authSSHKey).click();
      cy.contains(testVM.newSecret).should('exist');
    });
  });

  describe('Create VM from Registry with existing secret', () => {
    it('ID(CNV-8838) create VM with registry and existing secret', () => {
      vm.customizeCreate(testVM1, false);
    });

    it(
      'ID(CNV-8850) verify VM is up by checking its OS field',
      {
        retries: {
          runMode: 10,
        },
      },
      () => {
        cy.wait(30000);
        cy.get(vmView.os).should('contain', 'Fedora');
      },
    );

    it('ID(CNV-4022) verify the existing secret presents on the SSH tab', () => {
      tab.navigateToConfigurationDetails();
      cy.contains('Boot management').click();
      cy.get(vmView.bootMode(testVM1.name)).should('contain', testVM1.bootMode);
      cy.wait(60000);

      tab.navigateToConfigurationSSH();
      cy.contains(authSSHKey).click();
      cy.contains(TEST_SECRET_NAME).should('exist');
    });
  });
});
