import { VirtualMachineData } from '../../../types/vm';
import { cloneDisk, DiskSource } from '../../../utils/const/diskSource';
import { TEST_NS } from '../../../utils/const/index';
import { TEMPLATE } from '../../../utils/const/template';
import { vm } from '../../../views/vm-flow';

const testVM: VirtualMachineData = {
  bootMode: 'UEFI (secure)',
  disks: [cloneDisk],
  diskSource: DiskSource.cloneVolume,
  name: 'vm-from-existing-pvc',
  namespace: TEST_NS,
  template: TEMPLATE.CENTOSSTREAM9,
};

describe('Create vm from PVC with existing disk attached', () => {
  before(() => {
    cy.visit('');
    cy.deleteVMs([testVM]);
  });

  after(() => {
    cy.deleteVMs([testVM]);
  });

  describe('Create VM with existing PVC', () => {
    it('ID(CNV-7277) create VM with existing PVC', () => {
      vm.customizeCreate(testVM);
    });
  });
});
