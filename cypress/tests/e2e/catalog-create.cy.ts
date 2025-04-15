import { VirtualMachineData } from '../../types/vm';
import { cloneDisk, DiskSource, vmDisks } from '../../utils/const/diskSource';
import { TEST_NS } from '../../utils/const/index';
import { TEMPLATE } from '../../utils/const/template';
import { yamlEditor } from '../../views/selector-common';
import { closeButton } from '../../views/selector-overview';
import { listGroup } from '../../views/selector-template';
import { tab } from '../../views/tab';
import { vm } from '../../views/vm-flow';

const CUST_VM: VirtualMachineData = {
  disks: vmDisks,
  iType: 'u1.medium',
  name: 'vm-customized-it',
  namespace: TEST_NS,
  startOnCreation: true,
  volume: 'fedora',
};

const MIN_VM: VirtualMachineData = {
  disks: [],
  name: 'vm-no-disks-no-nic',
  namespace: TEST_NS,
  nics: [],
  startOnCreation: true,
  template: TEMPLATE.CENTOSSTREAM9,
};

const PVC_VM: VirtualMachineData = {
  bootMode: 'UEFI (secure)',
  disks: [cloneDisk],
  diskSource: DiskSource.cloneVolume,
  name: 'vm-from-existing-pvc',
  namespace: TEST_NS,
  template: TEMPLATE.CENTOSSTREAM9,
};

describe('Test Catalog', () => {
  before(() => {
    cy.visitCatalog();
  });

  it('create InstanceType VM with multiple disks', () => {
    vm.customizeIT(CUST_VM, false);
    tab.navigateToConfigurationStorage();
    CUST_VM.disks.forEach((disk) => {
      cy.contains(disk.name).should('exist');
    });
  });

  it('test CLI and YAML in instanceTypes tab', () => {
    cy.contains('tr.pf-m-clickable', 'centos-stream10').click();
    cy.contains('U series').click();
    cy.byButtonText('medium').click();
    cy.contains(listGroup, 'Operating system').should('contain', 'CentOS Stream 10');
    cy.contains(listGroup, 'InstanceType').should('contain', 'u1.medium');
    cy.byButtonText('YAML & CLI').click();
    cy.get('.pf-v6-c-modal-box__body').within(() => {
      cy.byButtonText('CLI').click();
      cy.contains(yamlEditor, 'virtctl create vm')
        .should('contain', '--preference=centos.stream10')
        .and('contain', '--instancetype=u1.medium');
    });
    cy.get(closeButton).click({ force: true });
  });

  it('create VM without disks and NIC', () => {
    vm.customizeCreate(MIN_VM, false);
  });

  it('create VM with existing PVC', () => {
    vm.customizeCreate(PVC_VM);
  });
});
