import { VirtualMachineData } from '../../types/vm';
import { K8S_KIND, TEST_NS } from '../../utils/const/index';
import { vm } from '../../views/vm';

const testVM: VirtualMachineData = {
  name: 'vm-from-it-fedora',
  volume: 'fedora',
};

describe('Create VM from instanceType', () => {
  before(() => {
    cy.login();
    cy.visit('');
  });

  after(() => {
    cy.deleteResource(K8S_KIND.VM, testVM.name, TEST_NS);
  });

  it('create VM from instanceType', () => {
    vm.create(testVM);
  });
});
