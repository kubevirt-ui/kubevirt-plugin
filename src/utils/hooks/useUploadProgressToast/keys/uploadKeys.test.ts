import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import {
  collectVmScopedUploadKeys,
  getBootableVolumeUploadKey,
  getUploadClusterForVm,
  getVmCdromUploadKey,
  getVmCdromUploadKeyFromVm,
  getVmDiskUploadKey,
  isVmScopedUploadKey,
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

  describe('isVmScopedUploadKey', () => {
    it('should match vm-disk upload keys for the same VM', () => {
      const uploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, DISK_NAME);

      expect(isVmScopedUploadKey(uploadKey, CLUSTER, NAMESPACE, VM_NAME)).toBe(true);
    });

    it('should match vm-cdrom upload keys for the same VM', () => {
      const uploadKey = getVmCdromUploadKey(CLUSTER, NAMESPACE, VM_NAME, CDROM_NAME);

      expect(isVmScopedUploadKey(uploadKey, CLUSTER, NAMESPACE, VM_NAME)).toBe(true);
    });

    it('should reject bootable-volume upload keys', () => {
      const uploadKey = getBootableVolumeUploadKey(BOOTABLE_VOLUME_NAMESPACE, BOOTABLE_VOLUME_NAME);

      expect(isVmScopedUploadKey(uploadKey, CLUSTER, NAMESPACE, VM_NAME)).toBe(false);
    });

    it('should reject upload keys for a different VM', () => {
      const uploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, 'other-vm', DISK_NAME);

      expect(isVmScopedUploadKey(uploadKey, CLUSTER, NAMESPACE, VM_NAME)).toBe(false);
    });
  });

  describe('getUploadClusterForVm', () => {
    it('should return empty string when VM has no cluster (single-cluster or hub)', () => {
      expect(
        getUploadClusterForVm({
          metadata: { name: VM_NAME, namespace: NAMESPACE },
          spec: { template: {} },
        }),
      ).toBe('');
    });

    it('should return fleet cluster when set on VM (ACM spoke)', () => {
      expect(
        getUploadClusterForVm({
          cluster: CLUSTER,
          metadata: { name: VM_NAME, namespace: NAMESPACE },
          spec: { template: {} },
        }),
      ).toBe(CLUSTER);
    });
  });

  describe('collectVmScopedUploadKeys', () => {
    it('should match spoke cluster keys and empty-cluster keys for the same VM', () => {
      const spokeUploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, DISK_NAME);
      const emptyClusterUploadKey = getVmDiskUploadKey('', NAMESPACE, VM_NAME, DISK_NAME);
      const uploads = {
        [emptyClusterUploadKey]: {},
        [getBootableVolumeUploadKey(BOOTABLE_VOLUME_NAMESPACE, BOOTABLE_VOLUME_NAME)]: {},
        [spokeUploadKey]: {},
      };

      expect(collectVmScopedUploadKeys(uploads, CLUSTER, NAMESPACE, VM_NAME)).toEqual([
        spokeUploadKey,
        emptyClusterUploadKey,
      ]);
    });

    it('should only match empty-cluster keys when VM cluster is empty', () => {
      const emptyClusterUploadKey = getVmDiskUploadKey('', NAMESPACE, VM_NAME, DISK_NAME);
      const spokeUploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, DISK_NAME);
      const uploads = {
        [emptyClusterUploadKey]: {},
        [spokeUploadKey]: {},
      };

      expect(collectVmScopedUploadKeys(uploads, '', NAMESPACE, VM_NAME)).toEqual([
        emptyClusterUploadKey,
      ]);
    });
  });
});
