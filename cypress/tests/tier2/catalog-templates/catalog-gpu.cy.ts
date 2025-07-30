import { VirtualMachineData } from '../../../types/vm';
import { DiskSource } from '../../../utils/const/diskSource';
import { gpuDescribe, TEST_NS } from '../../../utils/const/index';
import { TEMPLATE } from '../../../utils/const/template';
import { vm } from '../../../views/vm-flow';

const testVM: VirtualMachineData = {
  diskSource: DiskSource.Default,
  gpu: true,
  name: 'rhel9-with-gpu',
  namespace: TEST_NS,
  startOnCreation: true,
  template: TEMPLATE.RHEL9,
};

// This test is failed in CI due to the bash issue, but could pass locally
// so please run it locally with a cluster which support GPU
gpuDescribe('Test adding GPU device to VM', () => {
  before(() => {
    cy.visit('');
    cy.deleteVMs([testVM]);
  });

  after(() => {
    cy.deleteVMs([testVM]);
  });

  it('ID(CNV-8962) create VM with GPU device', () => {
    vm.customizeCreate(testVM);
    cy.exec(`virtctl ssh -i fixtures/cnv.key cloud-user@${testVM.name} -c lspci`)
      .its('stdout')
      .should('contain', 'NVIDIA');
    // cy.ssh_exec(testVM.name, 'lspci', 'NVIDIA');
  });
});
