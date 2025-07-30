import { VirtualMachineData } from '../../../types/vm';
import { DiskSource, lunDisk, shareDisk } from '../../../utils/const/diskSource';
import { adminOnlyDescribe, TEST_NS } from '../../../utils/const/index';
import { TEMPLATE } from '../../../utils/const/template';
import { addDisk } from '../../../views/modals';
import { tab } from '../../../views/tab';
import { vm } from '../../../views/vm-flow';

adminOnlyDescribe('Test Cluster SCSI persistent reservation', () => {
  before(() => {
    cy.beforeSpec();
    cy.visitOverviewVirt();
  });

  describe('Test Persistence Reservation', () => {
    const test_vm: VirtualMachineData = {
      diskSource: DiskSource.Default,
      name: 'test-vm',
      namespace: TEST_NS,
      startOnCreation: false,
      template: TEMPLATE.RHEL9,
    };

    before(() => {
      cy.deleteVM([test_vm]);
    });

    after(() => {
      cy.deleteVM([test_vm]);
    });

    it('ID(CNV-10746) enable Persistence Reservation', () => {
      tab.navigateToSettings();
      cy.contains('SCSI persistent reservation').click();
      cy.get('input[id="persistent-reservation-section"]').check({ force: true });
    });

    it('ID(CNV-10746) add disks to VM', () => {
      cy.visitCatalogVirt();
      cy.switchProject(TEST_NS);
      vm.create(test_vm, false);
      cy.wait(5000);
      tab.navigateToConfigurationStorage();
      cy.wait(5000);
      addDisk(lunDisk);
      cy.wait(30000);
      addDisk(shareDisk);
      cy.wait(5000);
    });

    it('ID(CNV-10746) verify VM spec is correct', () => {
      const spec = '.spec.template.spec.domain.devices.disks';
      const reservation = `"lun":{"bus":"virtio","reservation":true}`;
      const shareable = `"disk":{"bus":"virtio"},"name":"sharedisk","shareable":true`;

      cy.checkVMSpec(test_vm.name, spec, reservation, true);
      cy.checkVMSpec(test_vm.name, spec, shareable, true);
    });
  });
});
