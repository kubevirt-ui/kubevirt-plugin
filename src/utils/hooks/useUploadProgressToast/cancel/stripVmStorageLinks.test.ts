import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { UPLOAD_PROGRESS_STATUS } from '../constants';
import { type UploadEntry } from '../types';

import { getBootableVolumeUrl, getDataVolumeUrl, getVmStorageUrl } from '../completion/uploadLinks';
import {
  getBootableVolumeUploadKey,
  getVmCdromUploadKey,
  getVmDiskUploadKey,
} from '../keys/uploadKeys';
import {
  stripDataVolumeLinksFromUpload,
  stripLinksForDeletedBootableVolume,
  stripLinksForDeletedDataVolume,
  stripVmStorageLinksFromUploads,
} from './stripVmStorageLinks';

const CLUSTER = 'local-cluster';
const NAMESPACE = 'default';
const VM_NAME = 'test-vm';
const DISK_NAME = 'disk-0';
const DV_NAME = 'dv-disk-0';

const vm: V1VirtualMachine = {
  cluster: CLUSTER,
  metadata: { name: VM_NAME, namespace: NAMESPACE, uid: 'vm-uid' },
  spec: { template: {} },
};

const storageLink = { label: 'View disk', url: getVmStorageUrl(vm) };
const dataVolumeLink = {
  label: 'View DataVolume',
  url: getDataVolumeUrl(DV_NAME, NAMESPACE),
};

const createCanceledUpload = (): UploadEntry => ({
  contextLinks: [storageLink, dataVolumeLink],
  dvName: DV_NAME,
  dvNamespace: NAMESPACE,
  fileName: 'image.iso',
  progress: 40,
  status: UPLOAD_PROGRESS_STATUS.CANCELED,
  successLinks: [storageLink, dataVolumeLink],
});

describe('stripDataVolumeLinksFromUpload', () => {
  it('should remove DataVolume links and keep VM storage links', () => {
    const nextUpload = stripDataVolumeLinksFromUpload(createCanceledUpload());

    expect(nextUpload.contextLinks).toEqual([storageLink]);
    expect(nextUpload.successLinks).toEqual([storageLink]);
    expect(nextUpload.omittedLinkUrls).toEqual([dataVolumeLink.url]);
  });
});

describe('stripVmStorageLinksFromUploads', () => {
  it('should remove VM storage links from canceled uploads for the deleted VM', () => {
    const uploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, DISK_NAME);
    const uploads = { [uploadKey]: createCanceledUpload() };

    const nextUploads = stripVmStorageLinksFromUploads(uploads, CLUSTER, NAMESPACE, VM_NAME);

    expect(nextUploads[uploadKey].contextLinks).toEqual([]);
    expect(nextUploads[uploadKey].successLinks).toEqual([]);
  });

  it('should remove VM storage links from canceled CD-ROM uploads for the deleted VM', () => {
    const uploadKey = getVmCdromUploadKey(CLUSTER, NAMESPACE, VM_NAME, DISK_NAME);
    const uploads = {
      [uploadKey]: {
        ...createCanceledUpload(),
        contextLinks: [storageLink],
        successLinks: [storageLink],
      },
    };

    const nextUploads = stripVmStorageLinksFromUploads(uploads, CLUSTER, NAMESPACE, VM_NAME);

    expect(nextUploads[uploadKey].contextLinks).toEqual([]);
    expect(nextUploads[uploadKey].successLinks).toEqual([]);
  });

  it('should not change uploads for a different VM', () => {
    const uploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, 'other-vm', DISK_NAME);
    const uploads = { [uploadKey]: createCanceledUpload() };

    expect(stripVmStorageLinksFromUploads(uploads, CLUSTER, NAMESPACE, VM_NAME)).toBe(uploads);
  });
});

describe('stripLinksForDeletedDataVolume', () => {
  it('should remove DataVolume links from VM disk uploads', () => {
    const uploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, DISK_NAME);
    const uploads = { [uploadKey]: createCanceledUpload() };

    const nextUploads = stripLinksForDeletedDataVolume(uploads, DV_NAME, NAMESPACE);

    expect(nextUploads[uploadKey].contextLinks).toEqual([storageLink]);
    expect(nextUploads[uploadKey].successLinks).toEqual([storageLink]);
  });

  it('should remove the bootable volume success link when its DataVolume is deleted', () => {
    const volumeName = 'fedora-volume';
    const uploadKey = getBootableVolumeUploadKey(NAMESPACE, volumeName);
    const bootableVolumeLink = {
      label: 'View bootable volume',
      url: getBootableVolumeUrl(volumeName, NAMESPACE),
    };
    const uploads = {
      [uploadKey]: {
        dvName: volumeName,
        dvNamespace: NAMESPACE,
        fileName: 'image.iso',
        progress: 100,
        status: UPLOAD_PROGRESS_STATUS.SUCCESS,
        successLinks: [bootableVolumeLink],
      },
    };

    const nextUploads = stripLinksForDeletedDataVolume(uploads, volumeName, NAMESPACE);

    expect(nextUploads[uploadKey].successLinks).toEqual([]);
  });

  it('should not strip DataVolume links from a same-name upload on another cluster', () => {
    const uploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, DISK_NAME);
    const uploads = {
      [uploadKey]: {
        ...createCanceledUpload(),
        dvCluster: CLUSTER,
      },
    };

    expect(stripLinksForDeletedDataVolume(uploads, DV_NAME, NAMESPACE, 'other-cluster')).toBe(
      uploads,
    );
  });

  it('should only strip the matching cluster when same-name DataVolumes exist on different clusters', () => {
    const remoteCluster = 'remote-cluster';
    const localKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, DISK_NAME);
    const remoteKey = getVmDiskUploadKey(remoteCluster, NAMESPACE, VM_NAME, DISK_NAME);
    const uploads = {
      [localKey]: {
        ...createCanceledUpload(),
        dvCluster: CLUSTER,
      },
      [remoteKey]: {
        ...createCanceledUpload(),
        dvCluster: remoteCluster,
      },
    };

    const nextUploads = stripLinksForDeletedDataVolume(uploads, DV_NAME, NAMESPACE, CLUSTER);

    expect(nextUploads[localKey].contextLinks).toEqual([storageLink]);
    expect(nextUploads[localKey].successLinks).toEqual([storageLink]);
    expect(nextUploads[remoteKey]).toEqual(uploads[remoteKey]);
  });
});

describe('stripLinksForDeletedBootableVolume', () => {
  it('should remove the bootable volume success link', () => {
    const volumeName = 'fedora-volume';
    const uploadKey = getBootableVolumeUploadKey(NAMESPACE, volumeName);
    const bootableVolumeLink = {
      label: 'View bootable volume',
      url: getBootableVolumeUrl(volumeName, NAMESPACE),
    };
    const uploads = {
      [uploadKey]: {
        fileName: 'image.iso',
        progress: 100,
        status: UPLOAD_PROGRESS_STATUS.SUCCESS,
        successLinks: [bootableVolumeLink],
      },
    };

    const nextUploads = stripLinksForDeletedBootableVolume(uploads, NAMESPACE, volumeName);

    expect(nextUploads[uploadKey].successLinks).toEqual([]);
  });

  it('should not strip a bootable volume upload on another cluster', () => {
    const volumeName = 'fedora-volume';
    const uploadKey = getBootableVolumeUploadKey(NAMESPACE, volumeName, CLUSTER);
    const bootableVolumeLink = {
      label: 'View bootable volume',
      url: getBootableVolumeUrl(volumeName, NAMESPACE, CLUSTER),
    };
    const uploads = {
      [uploadKey]: {
        dvCluster: CLUSTER,
        fileName: 'image.iso',
        progress: 100,
        status: UPLOAD_PROGRESS_STATUS.SUCCESS,
        successLinks: [bootableVolumeLink],
      },
    };

    expect(
      stripLinksForDeletedBootableVolume(uploads, NAMESPACE, volumeName, 'other-cluster'),
    ).toBe(uploads);
  });
});
