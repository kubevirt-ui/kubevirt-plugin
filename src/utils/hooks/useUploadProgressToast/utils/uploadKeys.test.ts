import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import {
  getBootableVolumeUploadKey,
  getVmCdromUploadKey,
  getVmCdromUploadKeyFromVm,
  getVmDiskUploadKey,
} from './uploadKeys';

const CLUSTER = 'local-cluster';
const NAMESPACE = 'default';
const VM_NAME = 'test-vm';
const DISK_NAME = 'rootdisk';
const CDROM_NAME = 'cdrom-1';
const BOOTABLE_VOLUME_NAMESPACE = 'openshift-virtualization-os-images';
const BOOTABLE_VOLUME_NAME = 'fedora-40';

describe('uploadKeys', () => {
  describe('getVmDiskUploadKey', () => {
    it('should produce vm-disk/<cluster>/<namespace>/<vmName>/<diskName>', () => {
      expect(getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, DISK_NAME)).toBe(
        `vm-disk/${CLUSTER}/${NAMESPACE}/${VM_NAME}/${DISK_NAME}`,
      );
    });

    it('should handle empty cluster with leading slash in scope key', () => {
      expect(getVmDiskUploadKey('', NAMESPACE, VM_NAME, DISK_NAME)).toBe(
        `vm-disk//${NAMESPACE}/${VM_NAME}/${DISK_NAME}`,
      );
    });
  });

  describe('getVmCdromUploadKey', () => {
    it('should produce vm-cdrom/<cluster>/<namespace>/<vmName>/<cdromName>', () => {
      expect(getVmCdromUploadKey(CLUSTER, NAMESPACE, VM_NAME, CDROM_NAME)).toBe(
        `vm-cdrom/${CLUSTER}/${NAMESPACE}/${VM_NAME}/${CDROM_NAME}`,
      );
    });
  });

  describe('getVmCdromUploadKeyFromVm', () => {
    it('should extract cluster, namespace, and name from VM object', () => {
      const vm: V1VirtualMachine = {
        cluster: CLUSTER,
        metadata: { name: VM_NAME, namespace: NAMESPACE },
        spec: { template: {} },
      };

      expect(getVmCdromUploadKeyFromVm(vm, CDROM_NAME)).toBe(
        `vm-cdrom/${CLUSTER}/${NAMESPACE}/${VM_NAME}/${CDROM_NAME}`,
      );
    });
  });

  describe('getBootableVolumeUploadKey', () => {
    it('should produce bootable-volume/<namespace>/<name>', () => {
      expect(getBootableVolumeUploadKey(BOOTABLE_VOLUME_NAMESPACE, BOOTABLE_VOLUME_NAME)).toBe(
        `bootable-volume/${BOOTABLE_VOLUME_NAMESPACE}/${BOOTABLE_VOLUME_NAME}`,
      );
    });
  });
});
