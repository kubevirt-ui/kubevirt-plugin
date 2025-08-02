import secretFixture from '../../../fixtures/secret';
import { VirtualMachineData } from '../../../types/vm';
import { adminOnlyIT, OS_IMAGES_NS, TEST_NS, TEST_SECRET_NAME } from '../../../utils/const/index';
import { authSSHKey } from '../../../utils/const/string';
import { action, tabModal } from '../../../views/actions';
import { Perspective, switchPerspective } from '../../../views/perspective';
import * as cView from '../../../views/selector-catalog';
import { cpuMem, descrText } from '../../../views/selector-common';
import * as iView from '../../../views/selector-instance';
import * as oView from '../../../views/selector-overview';
import { tab } from '../../../views/tab';
import { vm } from '../../../views/vm-flow';

const os_ns_secret_name = 'os-ns-secret';

const VM_DEFAULT_SECRET: VirtualMachineData = {
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
  volume: 'rhel9',
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

describe('Test instanceType flow', () => {
  before(() => {
    cy.visit('');
    /*
    cy.deleteVM([
      VM_DEFAULT_SECRET,
      VM_CLONE_FROM_IT,
      VM_REPLACE_PROJECT_SECRET,
      VM_OTHER_PROJECT_SECRET,
    ])`o*/ cy.switchToVirt();
    cy.switchProject(TEST_NS);
  });

  /*
  after(() => {
    cy.deleteVM([
      VM_DEFAULT_SECRET,
      VM_CLONE_FROM_IT,
      VM_REPLACE_PROJECT_SECRET,
      VM_OTHER_PROJECT_SECRET,
    ]);
    cy.deleteResource('secret', os_ns_secret_name, OS_IMAGES_NS);
  });
 */

  describe('Create VM from instanceType in Catalog', () => {
    it('ID(CNV-9768) create VM instanceType without changing secret', () => {
      vm.instanceCreate(VM_DEFAULT_SECRET);
      tab.navigateToConfigurationSSH();
      cy.contains(authSSHKey).click();
      cy.contains(TEST_SECRET_NAME).should('exist');
      tab.navigateToConfigurationStorage();
      // TODO: revert after https://issues.redhat.com/browse/CNV-49651
      // cy.contains(VM_DEFAULT_SECRET.bootDiskSize).should('exist');
    });

    xit('ID(CNV-11408) change IT for created VM', () => {
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

    it('ID(CNV-9892) clone VM from instanceType', () => {
      action.clone(VM_DEFAULT_SECRET.name, VM_CLONE_FROM_IT.name, true, false);
      cy.wait(30000);
      cy.contains('.pf-v6-c-modal-box__title-text', 'Clone VirtualMachine', {
        timeout: 60000,
      }).should('not.exist');
      cy.get('[data-test-id="virtual-machine-overview-details-status"]').should(
        'contain',
        'Running',
      );
      tab.navigateToConfigurationSSH();
      cy.contains(authSSHKey).click();
      cy.contains(TEST_SECRET_NAME).should('exist');
    });

    it('ID(CNV-10284) verify instanceType VM chart in Overview', () => {
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
          runMode: 8,
        },
      },
      () => {
        cy.navigateToVMs();
      },
    );

    adminOnlyIT('ID(CNV-9789) existing Secret is not deleted along with the VM', () => {
      cy.stop(VM_DEFAULT_SECRET.name);
      cy.stop(VM_CLONE_FROM_IT.name);
      switchPerspective(Perspective.Administrator);
      cy.visitSecrets();
      cy.byLegacyTestID(TEST_SECRET_NAME).should('exist');
      switchPerspective(Perspective.Virtualization);
    });
  });

  xdescribe('Create VM from instanceType with secret from different project', () => {
    it('ID(CNV-10748) create VM by using Secret from another Project', () => {
      cy.exec(`echo '${JSON.stringify(OS_IMAGES_NS_SECRET)}' | oc create -f -`);
      vm.instanceCreate(VM_OTHER_PROJECT_SECRET);
      tab.navigateToConfigurationSSH();
      cy.contains(authSSHKey).click();
      cy.contains(VM_OTHER_PROJECT_SECRET.newSecretName).should('exist');
      cy.visitVirtPerspectiveOverview();
      tab.navigateToSettings();
      cy.byButtonText(iView.userButtonTxt).click();
      cy.contains(cView.manageKeysText).click();
      cy.contains(TEST_SECRET_NAME).should('exist');
    });

    it('ID(CNV-10762) create VM and replace default secret', () => {
      vm.instanceCreate(VM_REPLACE_PROJECT_SECRET);
      cy.visitVirtPerspectiveOverview();
      tab.navigateToSettings();
      cy.byButtonText(iView.userButtonTxt).click();
      cy.contains(cView.manageKeysText).click();
      cy.contains(VM_REPLACE_PROJECT_SECRET.newSecretName).click(); // check the key is replaced and restore it by below
      //cy.get('.pf-c-form__group.ssh-secret-section__form-group-secret').find('button').click();
      cy.get('button[placeholder="Select secret"]').click();
      cy.byButtonText(TEST_SECRET_NAME).click();
      cy.clickSaveBtn();
      cy.contains(TEST_SECRET_NAME).should('exist');
    });
  });
});
