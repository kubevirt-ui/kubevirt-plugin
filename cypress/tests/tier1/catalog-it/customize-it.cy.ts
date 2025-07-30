import { kvPair, VirtualMachineData } from '../../../types/vm';
import { TEST_NS, VM_STATUS } from '../../../utils/const/index';
import { authSSHKey } from '../../../utils/const/string';
import { action, tabModal } from '../../../views/actions';
import * as iView from '../../../views/selector-instance';
import { tab } from '../../../views/tab';
import { vm, waitForStatus } from '../../../views/vm-flow';

const newSecretName = 'test-secret-new';
const testkey = 'testlabel';
const testvalue = 'testcnv';
const label1 = `${testkey}=${testvalue}`;
const label2 = 'testlabel2=testcnv2';
const anno: kvPair = {
  key: 'test-annoation',
  value: 'cnv',
};
const selector: kvPair = {
  key: testkey,
  value: testvalue,
};

const TEST_VM: VirtualMachineData = {
  annotations: [anno],
  description: 'description of customize it',
  evictionStrategy: false,
  headless: true,
  hostname: 'test-customize-it',
  labels: [label1, label2],
  name: 'customize-it-vm',
  namespace: TEST_NS,
  //guestlog
  //bootMode
  newSecret: newSecretName,
  nodeSelector: selector,
  password: '123456',
  startInPause: true,
  //gpu
  username: 'redhat',
  volume: 'rhel9',
};

const node1 = Cypress.env('FIRST_NODE');
const node2 = Cypress.env('SECOND_NODE');
const node3 = Cypress.env('THIRD_NODE');

const NICLESS_VM: VirtualMachineData = {
  name: 'nicless-it-vm',
  namespace: TEST_NS,
  volume: 'fedora',
};

describe('Test instanceType flow', () => {
  before(() => {
    cy.visit('');
    cy.switchToVirt();
    cy.switchProject(TEST_NS);
    cy.deleteVM([TEST_VM, NICLESS_VM]);
    cy.deleteResource('secret', newSecretName, TEST_NS);
  });

  after(() => {
    cy.deleteVM([TEST_VM, NICLESS_VM]);
    cy.deleteResource('secret', newSecretName, TEST_NS);
    cy.exec(`oc label node ${node1} ${testkey}-`);
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

  it('ID(CNV-11231) verify the details of customized IT VM', () => {
    tab.navigateToConfigurationDetails();
    cy.contains(TEST_VM.description).should('exist');
    cy.contains(TEST_VM.hostname).should('exist');
    tab.navigateToConfigurationScheduling();
    cy.contains('LiveMigrate').should('not.exist');
    tab.navigateToConfigurationSSH();
    cy.contains(authSSHKey).click();
    cy.contains(newSecretName).should('exist');
    tab.navigateToConfigurationInitialRun();
    cy.contains(TEST_VM.username).should('exist');
    cy.exec(`oc get vm -l ${label1} | grep ${TEST_VM.name}`);
    cy.exec(`oc get vm ${TEST_VM.name} -o yaml | grep ${anno.key}`);
    cy.exec(`oc get vmi ${TEST_VM.name} -o yaml | grep ${node3}`);
  });

  it('ID(CNV-11519) create NIC-less VM from instanceType', () => {
    cy.visitCatalog(); // navigate back
    cy.contains(iView.volName, NICLESS_VM.volume).click();
    cy.get(iView.vmName).clear().type(NICLESS_VM.name);
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
