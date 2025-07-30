import { VirtualMachineData } from '../../../types/vm';
import { volData } from '../../../types/vol';
import { adminOnlyDescribe, K8S_KIND, TEST_NS } from '../../../utils/const/index';
import { addVolume } from '../../../views/instance-flow';
import * as iView from '../../../views/selector-instance';
import { tab } from '../../../views/tab';
import { vm } from '../../../views/vm-flow';

const VOL_UPLOAD: volData = {
  instanceType: 'large',
  iso: true,
  name: 'vol-win-11',
  preference: 'windows.11',
  sourceType: 'Upload',
  uploadImage: '/tmp/cirros.xz',
};
const TEST_VM: VirtualMachineData = {
  name: 'vm-windows',
  namespace: TEST_NS,
  startOnCreation: false,
  // todo: revert after https://issues.redhat.com/browse/CNV-41584
  // sysprepFile: 'sysprep.xml',
  volume: VOL_UPLOAD.name,
};

adminOnlyDescribe('Test windows volume', () => {
  before(() => {
    cy.deleteVMs([TEST_VM]);
  });

  after(() => {
    cy.deleteVMs([TEST_VM]);
    cy.deleteResource(K8S_KIND.PVC, VOL_UPLOAD.name, TEST_NS);
    cy.deleteResource(K8S_KIND.DV, VOL_UPLOAD.name, TEST_NS);
    cy.deleteResource(K8S_KIND.DS, VOL_UPLOAD.name, TEST_NS);
  });

  it('ID(CNV-11232) add volume via upload', () => {
    cy.visitCatalog();
    cy.switchProject(TEST_NS);
    cy.byButtonText(iView.addBtnText).click();
    addVolume(VOL_UPLOAD);
    cy.contains(VOL_UPLOAD.name).should('exist');
  });

  xit('ID(CNV-11232) created windows vm with sysprep file', () => {
    vm.customizeIT(TEST_VM);
    tab.navigateToConfigurationInitialRun();
    // check sysprep file presents
  });
});
