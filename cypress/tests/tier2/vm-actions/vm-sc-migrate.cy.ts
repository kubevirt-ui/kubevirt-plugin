import { VirtualMachineData } from '../../../types/vm';
import { blankDisk } from '../../../utils/const/diskSource';
import { MINUTE, mtcDescribe, TEST_NS } from '../../../utils/const/index';
import * as vma from '../../../views/actions';
import * as mView from '../../../views/migrate-modal';
import { closeButton } from '../../../views/selector-overview';
import { tab } from '../../../views/tab';
import { getRow, vm } from '../../../views/vm-flow';

const vmDestinationStorageClass = 'hostpath-csi-pvc-block';
const volDestinationStorageClass = 'ocs-storagecluster-ceph-rbd';

const testVM1: VirtualMachineData = {
  disks: [blankDisk],
  name: 'vm-sc-migration-vm',
  namespace: TEST_NS,
  volume: 'rhel9',
};

const testVM2: VirtualMachineData = {
  disks: [blankDisk],
  name: 'vm-sc-migration-vol',
  namespace: TEST_NS,
  volume: 'rhel10',
};

// https://issues.redhat.com/browse/CNV-63347
// mtcDescribe('Test storageClass migration', () => {
xdescribe('Test storageClass migration', () => {
  before(() => {
    cy.deleteVMs([testVM1, testVM2]);
    cy.exec('oc delete migplan --all --all-namespaces');
    cy.beforeSpec();
  });

  after(() => {
    cy.deleteVMs([testVM1, testVM2]);
  });

  it('create test VMs', () => {
    vm.customizeIT(testVM1, false);
    vm.customizeIT(testVM2, false);
    cy.exec(`oc wait --for=condition=ready vm/${testVM1.name} --timeout=300s`);
    cy.exec(`oc wait --for=condition=ready vm/${testVM2.name} --timeout=300s`);
  });

  describe(`Migrate the entire VM`, () => {
    it(`ID(CNV-11626) migrate the entire VM`, () => {
      cy.visitVMs();
      getRow(testVM1.name, () => cy.get(vma.vmActions).find('button').click());
      cy.get(vma.MIGRATE_MENU).click();
      cy.get(vma.MIGRATE_STORAGE).click();
      cy.get(mView.modal).should('be.visible');
      cy.get(mView.nextBtn).click();
      cy.get(mView.backBtn).click(); // verify back button is working
      cy.get(mView.nextBtn).click();
      cy.get(mView.selectSCBtn).click();
      cy.get(`button#select-inline-filter-${vmDestinationStorageClass}`).click();
      cy.get(mView.nextBtn).click();
      cy.get(mView.nextBtn).click();
      cy.contains(mView.modal, 'In progress').should('exist');
      cy.contains(mView.modal, 'Migration completed successfully', { timeout: MINUTE * 5 }).should(
        'exist',
      );
      cy.get(closeButton).click();
    });

    it('ID(CNV-11626) verify the storageclass of the disks', () => {
      cy.byLegacyTestID(testVM1.name).click();
      tab.navigateToConfigurationStorage();
      getRow('disk-blank', () =>
        cy.contains(vmDestinationStorageClass, { timeout: MINUTE }).should('exist'),
      );
      getRow('rootdisk', () =>
        cy.contains(vmDestinationStorageClass, { timeout: MINUTE }).should('exist'),
      );
    });
  });

  describe('Migrate the VM with selected volumes', () => {
    it('ID(CNV-11662) migrate the VM with selected volumes', () => {
      cy.visitVMs();
      getRow(testVM2.name, () => cy.get(vma.vmActions).find('button').click());
      cy.get(vma.MIGRATE_MENU).click();
      cy.get(vma.MIGRATE_STORAGE).click();
      cy.get(mView.modal).should('be.visible');
      cy.get(mView.selectedVolumes).click();
      cy.get('[aria-label="Select all rows"]').check();
      cy.get(mView.nextBtn).click();
      cy.get(mView.selectSCBtn).click();
      cy.get(`button#select-inline-filter-${volDestinationStorageClass}`).click();
      cy.get(mView.nextBtn).click();
      cy.get(mView.nextBtn).click();
      cy.contains(mView.modal, 'In progress').should('exist');
      cy.contains(mView.modal, 'Migration completed successfully', { timeout: MINUTE * 5 }).should(
        'exist',
      );
      cy.get(closeButton).click();
    });

    it('ID(CNV-11662) verify the storageclass of the disks', () => {
      cy.byLegacyTestID(testVM2.name).click();
      tab.navigateToConfigurationStorage();
      getRow('disk-blank', () =>
        cy.contains(volDestinationStorageClass, { timeout: MINUTE }).should('exist'),
      );
      getRow('rootdisk', () =>
        cy.contains(volDestinationStorageClass, { timeout: MINUTE }).should('exist'),
      );
    });
  });
});
