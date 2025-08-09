import { VirtualMachineData } from '../../../types/vm';
import { DiskSource, vmDisks, vmDisks1 } from '../../../utils/const/diskSource';
import { K8S_KIND, OS_IMAGES_NS, SECOND, TEST_NS, TEST_PVC_NAME } from '../../../utils/const/index';
import { TEMPLATE } from '../../../utils/const/template';
import { fillInstanceType } from '../../../views/instance-flow';
import * as iView from '../../../views/selector-instance';
import { vm } from '../../../views/vm-flow';

const testVM: VirtualMachineData = {
  bootMode: 'UEFI (secure)',
  disks: vmDisks,
  diskSource: DiskSource.Default,
  name: 'vm-with-multiple-disks',
  namespace: TEST_NS,
  startOnCreation: true,
  template: TEMPLATE.CENTOSSTREAM9,
};

const testVM1: VirtualMachineData = {
  bootMode: 'UEFI (secure)',
  disks: vmDisks1,
  diskSource: DiskSource.Default,
  name: 'vm-with-multiple-disks-1',
  namespace: TEST_NS,
  startOnCreation: true,
  template: TEMPLATE.RHEL9,
};

const testVM2: VirtualMachineData = {
  name: 'vm-from-huge-volume',
  namespace: TEST_NS,
  volume: 'auto-ten-tib-vol',
};

xdescribe('Customize VirtualMachine', () => {
  before(() => {
    cy.deleteVMs([testVM, testVM1, testVM2]);
    cy.deleteResource(K8S_KIND.PVC, 'vm-with-multiple-disks-1-disk-upload', TEST_NS);
    cy.deleteResource(K8S_KIND.DV, testVM2.volume, OS_IMAGES_NS);
    cy.beforeSpec();
  });

  after(() => {
    cy.deleteVMs([testVM, testVM1, testVM2]);
    cy.deleteResource(K8S_KIND.PVC, 'vm-with-multiple-disks-1-disk-upload', TEST_NS);
    cy.deleteResource(K8S_KIND.DV, testVM2.volume, OS_IMAGES_NS);
  });

  // https://issues.redhat.com/browse/CNV-56241
  xdescribe('Create VM with multiple disks', () => {
    it('ID(CNV-7277) create VM with blank ephemeral and clone pvc disks', () => {
      vm.customizeCreate(testVM);
      cy.deleteVMs([testVM]);
    });

    it('ID(CNV-7277) create VM with pvc and upload disks', () => {
      vm.customizeCreate(testVM1);
    });
  });

  xdescribe('Show progress bar when cloning/importing VM DataVolume', () => {
    it('ID(CNV-11273) show progressbar when copying files', () => {
      cy.visitCatalog();
      cy.byButtonText(iView.addBtnText).click();
      cy.get('#tab-modal').within(() => {
        cy.get(iView.volumeName).type(testVM2.volume); // fill name
        // select preference
        cy.contains(iView.toggleText, iView.selectPreferenceText).click();
        cy.get(iView.searchPreference).type('alpine');
        cy.get(iView.preferenceValue('alpine')).click();
        // select instanceType
        cy.contains(iView.toggleText, iView.selectInstanceText).click({ force: true });
        cy.contains(iView.menuItemText, 'Red Hat provided').click();
        cy.contains(iView.menuItemText, 'U series').click();
        cy.contains(iView.menuItemText, 'small:').click({ force: true });

        cy.contains(iView.toggleText, 'Upload volume').click({ force: true });
        cy.contains(iView.menuItemText, 'Use existing volume').click();
        cy.contains(iView.toggleText, iView.selectPVCNS).click();
        cy.get(iView.PVCNSValue(TEST_NS)).click();
        cy.contains(iView.toggleText, iView.selectPVCName).click();
        cy.contains(TEST_PVC_NAME).click();

        cy.get('input[type="number"]').clear().type('10');
        cy.byButtonText('GiB').click();
        cy.byButtonText('TiB').click();
        // cy.get(iView.description).scrollIntoView().type(`Test volume from ${vType}`); // file description
        cy.clickSaveBtn();
        cy.wait(3 * SECOND); // wait for sometime for the clone finishing
        cy.contains(iView.modalTitle, iView.modalTitleText).should('not.exist');
        cy.wait(5 * SECOND); // give a bit more time for volume present
      });
      // cy.switchProject(TEST_NS);
      fillInstanceType(testVM2);
      cy.byButtonText(iView.createBtnText).click();
      cy.get('.VirtualMachinesOverviewTabDetails--details').scrollIntoView();
      cy.byButtonText('Provisioning').click();
      cy.get('.pf-v6-c-popover').within(() => {
        cy.contains('Copying files').should('exist');
        cy.get(iView.progress).should('exist');
      });
    });
  });
});
