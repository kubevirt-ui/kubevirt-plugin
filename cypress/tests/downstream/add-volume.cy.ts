import { VirtualMachineData } from '../../types/vm';
import { volData } from '../../types/vol';
import {
  CONTAINER_IMAGE,
  K8S_KIND,
  OS_IMAGES_NS,
  TEST_NS,
  TEST_PVC_NAME,
  TEST_SECRET_NAME,
} from '../../utils/const/index';
import { authSSHKey } from '../../utils/const/string';
import { addVolume, delVolume } from '../../views/instance-flow';
import * as iView from '../../views/selector-instance';
import { tab } from '../../views/tab';
import { vm } from '../../views/vm-flow';

const VOL_VOLUME: volData = {
  instanceType: 'large',
  name: 'vol-exist-volume',
  preference: 'alpine',
  project: TEST_NS,
  pvcName: TEST_PVC_NAME,
  sourceType: 'Volume',
};
const VOL_VOLUME_SNAPSHOT: volData = {
  instanceType: 'small',
  name: 'vol-volume-snapshot',
  preference: 'rhel.9',
  sourceType: 'Volume snapshot',
  volName: 'rhel9',
};
const VOL_REGISTRY: volData = {
  instanceType: 'small',
  name: 'vol-registry',
  preference: 'fedora',
  registryURL: CONTAINER_IMAGE,
  sourceType: 'Registry',
};
const VOL_UPLOAD: volData = {
  instanceType: 'large',
  iso: true,
  name: 'cirros-uploaded',
  preference: 'cirros',
  sourceType: 'Upload',
  uploadImage: '/tmp/cirros.xz',
};

const vols = [VOL_VOLUME.name, VOL_VOLUME_SNAPSHOT.name, VOL_REGISTRY.name];

const VM_FROM_ADDVOL: VirtualMachineData = {
  name: 'vm-from-add-volume',
  namespace: TEST_NS,
  volume: VOL_VOLUME_SNAPSHOT.name,
};

const cleanUp = () => {
  cy.deleteResources(K8S_KIND.PVC, vols, OS_IMAGES_NS);
  cy.deleteResources(K8S_KIND.PVC, vols, TEST_NS);
  cy.deleteResources(K8S_KIND.DV, vols, OS_IMAGES_NS);
  cy.deleteResources(K8S_KIND.DV, vols, TEST_NS);
  cy.deleteResources(K8S_KIND.DS, vols, OS_IMAGES_NS);
  cy.deleteResources(K8S_KIND.DS, vols, TEST_NS);
};

// skip this test due to it cannot find the element in source dropdown menu
xdescribe('Test instanceType add volume modal', () => {
  describe('Test add volume in Catalog', () => {
    before(() => {
      cy.visit('');
      cleanUp();
      cy.deleteVM([VM_FROM_ADDVOL]);
      cy.switchToVirt();
      cy.visitCatalog();
    });

    after(() => {
      cleanUp();
      cy.deleteVM([VM_FROM_ADDVOL]);
    });

    it('add volume via snapshot', () => {
      cy.byButtonText(iView.addBtnText).click();
      addVolume(VOL_VOLUME_SNAPSHOT);
      cy.contains(VOL_VOLUME_SNAPSHOT.name, { timeout: 10000 }).should('exist');
    });

    it('add volume via registry', () => {
      cy.byButtonText(iView.addBtnText).click();
      addVolume(VOL_REGISTRY);
      cy.contains(VOL_REGISTRY.name, { timeout: 180000 }).should('exist');
    });

    it('add volume via existing volume', () => {
      cy.byButtonText(iView.addBtnText).click();
      addVolume(VOL_VOLUME);
      cy.contains(VOL_VOLUME.name, { timeout: 180000 }).should('exist');
    });

    it('create VM from added volume with new secret', () => {
      vm.instanceCreate(VM_FROM_ADDVOL);
      tab.navigateToConfigurationSSH();
      cy.contains(authSSHKey).click();
      cy.contains(TEST_SECRET_NAME).should('exist');
    });
  });

  describe('Test add volume in Bootable volumes list', () => {
    const vols1 = [VOL_VOLUME.name, VOL_VOLUME_SNAPSHOT.name, VOL_UPLOAD.name];
    before(() => {
      cleanUp();
    });

    beforeEach(() => {
      cy.visitVirtPerspectiveVols();
      cy.wait(3000);
    });

    it('add volume via upload in Bootable volumes list', () => {
      cy.get('[data-test="item-create"]').click();
      cy.byButtonText(iView.withForm).click();
      addVolume(VOL_UPLOAD);
      cy.contains(VOL_UPLOAD.name, { timeout: 10000 }).should('exist');
    });

    it('add volume via existing volume in Bootable volumes list', () => {
      cy.get('[data-test="item-create"]').click();
      cy.byButtonText(iView.withForm).click();
      addVolume(VOL_VOLUME);
      cy.contains(VOL_VOLUME.name, { timeout: 180000 }).should('exist');
    });

    it('add volume via snapshot', () => {
      cy.get('[data-test="item-create"]').click();
      cy.byButtonText(iView.withForm).click();
      addVolume(VOL_VOLUME_SNAPSHOT);
      cy.contains(VOL_VOLUME_SNAPSHOT.name, { timeout: 180000 }).should('exist');
    });

    it('add volume via registry', () => {
      cy.get('[data-test="item-create"]').click();
      cy.byButtonText(iView.withForm).click();
      addVolume(VOL_REGISTRY);
      cy.contains(VOL_REGISTRY.name, { timeout: 180000 }).should('exist');
    });

    it('delete volumes', () => {
      vols1.forEach((vol) => {
        delVolume(vol);
        cy.wait(2000);
      });
    });
  });
});
