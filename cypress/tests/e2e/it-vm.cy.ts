import secretFixture from '../../fixtures/secret';
// import { tab } from '../../views/tab';
// import { vm } from '../../views/vm-flow';
import { kvPair, VirtualMachineData } from '../../types/vm';
import { OS_IMAGES_NS, TEST_NS, TEST_SECRET_NAME, VM_STATUS } from '../../utils/const/index';
import { authSSHKey } from '../../utils/const/string';
// import { authSSHKey } from '../../utils/const/string';
// import { action, tabModal } from '../../views/actions';
import { action, tabModal } from '../../views/actions';
import { Perspective, switchPerspective } from '../../views/perspective';
import * as cView from '../../views/selector-catalog';
import { cpuMem, descrText } from '../../views/selector-common';
import * as iView from '../../views/selector-instance';
import * as oView from '../../views/selector-overview';
import { tab } from '../../views/tab';
import { vm, waitForStatus } from '../../views/vm-flow';

const os_ns_secret_name = 'os-ns-secret';

const VM_DEFAULT_SECRET: VirtualMachineData = {
  // reverted after https://issues.redhat.com/browse/CNV-49651
  bootDiskSize: '4', // the '0' in input area cannot be cleared
  name: 'vm-default-secret',
  namespace: TEST_NS,
  startOnCreation: true,
  volume: 'centos-stream10',
};

const VM_CLONE_FROM_IT: VirtualMachineData = {
  name: 'vm-clone-from-it',
  namespace: TEST_NS,
};

const OS_IMAGES_NS_SECRET = {
  apiVersion: 'v1',
  data: {
    key: secretFixture.data.key,
  },
  kind: 'Secret',
  metadata: {
    name: os_ns_secret_name,
    namespace: OS_IMAGES_NS,
  },
  type: 'Opaque',
};

const VM_OTHER_PROJECT_SECRET: VirtualMachineData = {
  existSecret: OS_IMAGES_NS_SECRET.metadata.name,
  name: 'vm-other-project-secret',
  namespace: TEST_NS,
  newSecretName: 'secret-from-diff-project',
  secretProject: OS_IMAGES_NS,
  startOnCreation: true,
  volume: 'centos-stream9',
};

const VM_REPLACE_PROJECT_SECRET: VirtualMachineData = {
  applyKey: true,
  existSecret: OS_IMAGES_NS_SECRET.metadata.name,
  name: 'vm-replace-project-secret',
  namespace: TEST_NS,
  newSecretName: 'replace-secret',
  secretProject: OS_IMAGES_NS,
  startOnCreation: true,
  volume: 'fedora',
};

const newSecretName = 'test-secret-new';
const testkey = 'testlabel';
const testvalue = 'testcnv';
const label1 = `${testkey}=${testvalue}`;
const label2 = 'testlabel2=testcnv2';
const anno: kvPair = {
  key: 'test-annotation',
  value: 'cnv',
};
const selector: kvPair = {
  key: testkey,
  value: testvalue,
};

const TEST_VM: VirtualMachineData = {
  annotations: [anno],
  cloudInitPwd: '123456',
  cloudInitUname: 'redhat',
  description: 'description of customize it',
  evictionStrategy: false,
  headless: true,
  hostname: 'test-customize-it',
  labels: [label1, label2],
  name: 'customize-it-vm',
  //guestlog
  //bootMode
  namespace: TEST_NS,
  newSecret: newSecretName,
  nodeSelector: selector,
  //gpu
  startInPause: true,
  volume: 'fedora',
};

const node3 = Cypress.env('THIRD_NODE');

const NICLESS_VM: VirtualMachineData = {
  name: 'nicless-it-vm',
  namespace: TEST_NS,
  volume: 'fedora',
};

describe('Create VM from instanceType in Catalog', () => {
  before(() => {
    cy.visit('');
    cy.deleteVM([
      VM_DEFAULT_SECRET,
      VM_CLONE_FROM_IT,
      VM_REPLACE_PROJECT_SECRET,
      VM_OTHER_PROJECT_SECRET,
    ]);
    cy.switchToVirt();
  });

  after(() => {
    cy.deleteVM([
      VM_DEFAULT_SECRET,
      VM_CLONE_FROM_IT,
      VM_REPLACE_PROJECT_SECRET,
      VM_OTHER_PROJECT_SECRET,
    ]);
    cy.deleteResource('secret', os_ns_secret_name, OS_IMAGES_NS);
    cy.deleteResource('secret', VM_OTHER_PROJECT_SECRET.newSecretName, TEST_NS);
    cy.deleteResource('secret', VM_REPLACE_PROJECT_SECRET.newSecretName, TEST_NS);
  });

  it('create VM instanceType with default NS secret', () => {
    vm.instanceCreate(VM_DEFAULT_SECRET);
    tab.navigateToConfigurationSSH();
    cy.contains(authSSHKey).click();
    cy.contains(TEST_SECRET_NAME).should('exist');
    tab.navigateToConfigurationStorage();
    // TODO: revert after https://issues.redhat.com/browse/CNV-49651
    cy.contains(VM_DEFAULT_SECRET.bootDiskSize).should('exist');
  });

  xit('change IT for created VM', () => {
    tab.navigateToConfigurationDetails();
    cy.get(cpuMem).click();
    cy.get(tabModal).within(() => {
      cy.get(cView.menuToggle).eq(0).click();
      cy.byButtonText('Overcommited').click();
      cy.get(cView.menuToggle).eq(1).click();
      cy.contains(cView.menuToggle, 'medium').click();
      cy.clickSaveBtn();
    });
    cy.contains(descrText, 'Overcommited').should('exist');
    cy.contains(cpuMem, '1 CPU | 4 GiB Memory').should('exist');
    tab.navigateToOverview();
    cy.contains(oView.resItem, 'o1.medium').should('exist');
  });

  it('clone VM from instanceType', () => {
    action.clone(VM_DEFAULT_SECRET.name, VM_CLONE_FROM_IT.name, true, false);
    cy.wait(30000);
    cy.contains('.pf-v6-c-modal-box__title-text', 'Clone VirtualMachine', {
      timeout: 60000,
    }).should('not.exist');
    cy.get('[data-test-id="virtual-machine-overview-details-status"]').should('contain', 'Running');
    tab.navigateToConfigurationSSH();
    cy.contains(authSSHKey).click();
    cy.contains(TEST_SECRET_NAME).should('exist');
  });

  it('verify instanceType VM chart in Overview', () => {
    cy.visitVirtPerspectiveOverview();
    cy.get(oView.chartTypeSelect).click();
    cy.contains(oView.itText).click();
    cy.contains('.kv-running-vms-card__legend-label--count', '3').should('exist');
    cy.contains('U series').should('exist');
  });

  it(
    'visit vm list page',
    {
      retries: {
        openMode: 0,
        runMode: 8,
      },
    },
    () => {
      cy.navigateToVMs();
    },
  );

  it('existing Secret is not deleted along with the VM', () => {
    cy.stop(VM_DEFAULT_SECRET.name);
    cy.stop(VM_CLONE_FROM_IT.name);
    switchPerspective(Perspective.Administrator);
    cy.visitSecrets();
    cy.byLegacyTestID(TEST_SECRET_NAME).should('exist');
    switchPerspective(Perspective.Virtualization);
  });
});

describe('Test instanceType flow', () => {
  before(() => {
    cy.visit('');
    cy.switchToVirt();
    cy.deleteVM([TEST_VM, NICLESS_VM]);
    cy.deleteResource('secret', newSecretName, TEST_NS);
    cy.switchProject(TEST_NS);
  });

  after(() => {
    cy.deleteVM([TEST_VM, NICLESS_VM]);
    cy.deleteResource('secret', newSecretName, TEST_NS);
    //cy.exec(`oc label node ${node1} ${testkey}-`);
  });

  it('label node', () => {
    cy.exec(`oc label node ${node3} ${label1}`);
  });

  it('unpause vm', () => {
    vm.customizeIT(TEST_VM, false);
    cy.wait(20000);
    action.unpause(TEST_VM.name, false);
    cy.wait(20000);
  });

  it('customize VM from instanceType', () => {
    tab.navigateToConfigurationDetails();
    cy.contains(TEST_VM.description).should('exist');
    cy.contains(TEST_VM.hostname).should('exist');
    tab.navigateToScheduling();
    cy.contains('LiveMigrate').should('not.exist');
    tab.navigateToConfigurationSSH();
    cy.contains(authSSHKey).click();
    cy.contains(newSecretName).should('exist');
    tab.navigateToConfigurationInitialRun();
    cy.contains(TEST_VM.cloudInitUname).should('exist');
    cy.exec(`oc get vm -l ${label1} | grep ${TEST_VM.name}`);
    cy.exec(`oc get vm ${TEST_VM.name} -o yaml | grep ${anno.key}`);
    cy.exec(`oc get vmi ${TEST_VM.name} -o yaml | grep ${node3}`);
  });

  it('create NIC-less VM from instanceType', () => {
    cy.visitCatalog(); // navigate back
    cy.contains(iView.volName, NICLESS_VM.volume).click();
    cy.get(iView.vmName).clear();
    cy.get(iView.vmName).type(NICLESS_VM.name);
    cy.byButtonText('Customize VirtualMachine').click();
    cy.contains('.pf-v6-c-tabs__item-text', 'Network').click();
    cy.wait(3000);
    cy.get('#toggle-id-network').click();
    cy.byButtonText('Delete').click();
    cy.get(tabModal).within(() => {
      cy.checkTitle('Delete NIC?');
      cy.byButtonText('Delete').click();
    });
    cy.contains('Not found').should('exist');
    cy.byButtonText(iView.createBtnText).click();
    cy.get('.VirtualMachinesOverviewTabDetails--details').scrollIntoView();
    waitForStatus(NICLESS_VM.name, VM_STATUS.Running, false);
  });
});
