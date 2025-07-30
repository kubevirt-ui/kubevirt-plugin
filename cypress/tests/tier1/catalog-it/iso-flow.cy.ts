import { VirtualMachineData } from '../../../types/vm';
import { volData } from '../../../types/vol';
import { adminOnlyDescribe, K8S_KIND, TEST_NS } from '../../../utils/const/index';
import { addVolume } from '../../../views/instance-flow';
import { addBtnText } from '../../../views/selector-instance';
import { tab } from '../../../views/tab';
import { getRow, vm } from '../../../views/vm-flow';

const VOL_ISO: volData = {
  instanceType: 'nano',
  iso: true,
  name: 'vol-cirros-iso',
  preference: 'alpine',
  sourceType: 'Upload',
  uploadImage: '/tmp/cirros.xz',
};
const TEST_VM: VirtualMachineData = {
  name: 'vm-from-iso',
  namespace: TEST_NS,
  volume: VOL_ISO.name,
};

adminOnlyDescribe('Test ISO flow', () => {
  before(() => {
    cy.visit('');
    cy.deleteVM([TEST_VM]);
    cy.deleteResource(K8S_KIND.PVC, VOL_ISO.name, TEST_NS);
    cy.deleteResource(K8S_KIND.DV, VOL_ISO.name, TEST_NS);
    cy.deleteResource(K8S_KIND.DS, VOL_ISO.name, TEST_NS);
    cy.switchToVirt();
    cy.visitCatalog();
    cy.switchProject(TEST_NS);
  });

  after(() => {
    cy.deleteVM([TEST_VM]);
    cy.deleteResource(K8S_KIND.PVC, VOL_ISO.name, TEST_NS);
    cy.deleteResource(K8S_KIND.DV, VOL_ISO.name, TEST_NS);
    cy.deleteResource(K8S_KIND.DS, VOL_ISO.name, TEST_NS);
  });

  it('ID(CNV-11425) add ISO volume via upload', () => {
    cy.byButtonText(addBtnText).click();
    addVolume(VOL_ISO);
    cy.contains(VOL_ISO.name).should('exist');
  });

  it('ID(CNV-11231) create vm from ISO volume', () => {
    vm.instanceCreate(TEST_VM);
  });

  it('verify pvc link on disk tab', () => {
    tab.navigateToConfigurationStorage();
    cy.wait(10000);
    cy.get(`a[data-test-id="${TEST_VM.name}-volume"]`).click();
    cy.contains('DataVolume details').should('exist');
  });

  it(
    'visit vm list page',
    {
      retries: {
        runMode: 8,
      },
    },
    () => {
      cy.visitVMsVirt();
    },
  );

  it('detach vm disk', () => {
    cy.patchVM(TEST_VM.name, 'Halted');
    cy.byLegacyTestID(TEST_VM.name).click();
    tab.navigateToConfigurationStorage();
    cy.wait(10000);
    getRow(`${TEST_VM.name}-cdrom-iso`, () => cy.get('button[id="toggle-id-6"]').click());
    cy.contains('.pf-v6-c-menu__item-text', 'Detach').click();
    cy.byButtonText('Detach').click();
    cy.contains(`${TEST_VM.name}-cdrom-iso`).should('not.exist');
  });
});
