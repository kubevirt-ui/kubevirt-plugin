import { VirtualMachineData } from '../../../types/vm';
import { DiskSource } from '../../../utils/const/diskSource';
import { QUAY_USER, QUAY_USER_PASSWD, TEST_NS } from '../../../utils/const/index';
import { TEMPLATE } from '../../../utils/const/template';
import { VM_PVC, VM_UPLOAD } from '../../../utils/const/testVM';
import { vm } from '../../../views/vm-flow';

const VM_REGISTRY: VirtualMachineData = {
  diskSource: DiskSource.Registry,
  name: 'vm-from-registry-credentials',
  namespace: TEST_NS,
  rPasswd: QUAY_USER_PASSWD,
  rUsername: QUAY_USER,
  template: TEMPLATE.FEDORA,
};

describe('Create VM from catalog', () => {
  before(() => {
    cy.visit('');
    cy.deleteVM([VM_PVC, VM_UPLOAD]);
    cy.switchToVirt();
    cy.visitCatalog();
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

  it('ID(CNV-11678) create VM from registry with username/password via quick button', () => {
    vm.create(VM_REGISTRY, false);
    cy.checkVMSpec(VM_REGISTRY.name, '.spec.dataVolumeTemplates', 'secretRef', true);
  });

  // the VM provisioning is long, so verify the VM status separately
  it(
    'verify VM is up',
    {
      retries: {
        openMode: 0,
        runMode: 5,
      },
    },
    () => {
      cy.exec(`oc wait --for=condition=ready vm/${VM_REGISTRY.name} --timeout=300s`);
    },
  );

  it('delete VM', () => {
    cy.deleteVM([VM_REGISTRY]);
  });

  // TODO: enable the test after https://issues.redhat.com/browse/CNV-53248
  xit('ID(CNV-11678) create VM from registry with username/password via customize button', () => {
    vm.customizeCreate(VM_REGISTRY, false);
    cy.checkVMSpec(VM_REGISTRY.name, '.spec.dataVolumeTemplates', 'secretRef', true);
  });

  xit(
    'verify VM is up',
    {
      retries: {
        openMode: 0,
        runMode: 5,
      },
    },
    () => {
      cy.exec(`oc wait --for=condition=ready vm/${VM_REGISTRY.name} --timeout=300s`);
    },
  );

  xit('delete VM', () => {
    cy.deleteVM([VM_REGISTRY]);
  });
});
