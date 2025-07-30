import { VirtualMachineData } from '../../../types/vm';
import { DiskSource } from '../../../utils/const/diskSource';
import { TEST_NS } from '../../../utils/const/index';
import { TEMPLATE } from '../../../utils/const/template';
import { VM_PVC, VM_UPLOAD } from '../../../utils/const/testVM';
import { vm } from '../../../views/vm-flow';

const VM_REGISTRY: VirtualMachineData = {
  diskSource: DiskSource.Registry,
  name: 'vm-from-registry',
  namespace: TEST_NS,
  template: TEMPLATE.FEDORA,
};

describe('Create VM from catalog', () => {
  before(() => {
    cy.beforeSpec();
    cy.deleteVM([VM_PVC, VM_REGISTRY, VM_UPLOAD]);
    cy.visitCatalogVirt();
    cy.switchProject(TEST_NS);
  });

  after(() => {
    cy.deleteVM([VM_PVC, VM_REGISTRY, VM_UPLOAD]);
  });

  it('ID(CNV-8852) create VM from upload image', () => {
    vm.customizeCreate(VM_UPLOAD, true);
    cy.deleteVM([VM_UPLOAD]);
  });

  it('ID(CNV-8862) create VM from PVC', () => {
    vm.customizeCreate(VM_PVC, true);
    cy.deleteVM([VM_PVC]);
  });

  it('ID(CNV-11678) create VM from registry with via quick button', () => {
    vm.create(VM_REGISTRY, false);
    cy.checkVMSpec(VM_REGISTRY.name, '.spec.dataVolumeTemplates', 'secretRef', true);
  });

  // the VM provisioning is long, so verify the VM status separately
  it(
    'verify VM is up',
    {
      retries: {
        runMode: 8,
      },
    },
    () => {
      cy.exec(`oc wait --for=condition=ready vm/${VM_REGISTRY.name} --timeout=300s`);
    },
  );

  it('delete VM', () => {
    cy.deleteVM([VM_REGISTRY]);
  });
});
