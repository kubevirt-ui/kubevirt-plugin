import { VirtualMachineData } from '../../../types/vm';
import { cloneDisk, DiskSource } from '../../../utils/const/diskSource';
import { TEST_NS, VM_STATUS } from '../../../utils/const/index';
import { TEMPLATE } from '../../../utils/const/template';
import { vm, waitForStatus } from '../../../views/vm-flow';

const testVM: VirtualMachineData = {
  bootMode: 'UEFI (secure)',
  disks: [cloneDisk],
  diskSource: DiskSource.cloneVolume,
  name: 'vm-from-existing-pvc',
  namespace: TEST_NS,
  template: TEMPLATE.CENTOSSTREAM9,
};

xdescribe('Create vm from PVC with existing disk attached', () => {
  before(() => {
    cy.deleteVMs([testVM]);
    cy.beforeSpec();
  });

  after(() => {
    cy.deleteVMs([testVM]);
  });

  it('ID(CNV-7277) create VM with existing PVC', () => {
    vm.customizeCreate(testVM, false);
    cy.startVM([testVM.name]);
    waitForStatus(testVM.name, VM_STATUS.Running, false);
  });
});
