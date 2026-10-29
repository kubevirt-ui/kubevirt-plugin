import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { UPLOAD_PROGRESS_STATUS } from '../constants';

import {
  getBootableVolumesListUrl,
  getBootableVolumeUrl,
  getDataVolumeUrl,
  getVmStorageUrl,
} from '../completion/uploadLinks';
import { type UploadsStoreSliceData } from '../features/uploads/types/types';
import {
  getBootableVolumeUploadKey,
  getVmCdromUploadKey,
  getVmDiskUploadKey,
} from '../keys/uploadKeys';
import { type ProgressToastState } from '../shared/types/types';
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

const createProgressToastState = (
  overrides: Partial<ProgressToastState> = {},
): ProgressToastState => ({
  fileName: 'image.iso',
  progress: 40,
  status: UPLOAD_PROGRESS_STATUS.UPLOADING,
  ...overrides,
});

const createUploadsData = (
  uploadKey: string,
  overrides: Partial<ProgressToastState> = {},
): UploadsStoreSliceData => ({
  [uploadKey]: { progressToastState: createProgressToastState(overrides) },
});

const createCanceledUpload = (): ProgressToastState =>
  createProgressToastState({
    contextLinks: [storageLink, dataVolumeLink],
    dvName: DV_NAME,
    dvNamespace: NAMESPACE,
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

  it('should remove the bootable volumes list link from an aborted bootable volume upload', () => {
    const volumeName = 'fedora-volume';
    const listLink = {
      label: 'Bootable volume fedora-volume',
      url: getBootableVolumesListUrl(NAMESPACE),
    };
    const upload: ProgressToastState = {
      contextLinks: [listLink],
      dvName: volumeName,
      dvNamespace: NAMESPACE,
      fileName: 'image.iso',
      progress: 40,
      status: UPLOAD_PROGRESS_STATUS.CANCELED,
    };

    const nextUpload = stripDataVolumeLinksFromUpload(
      upload,
      getBootableVolumeUploadKey(NAMESPACE, volumeName),
    );

    expect(nextUpload.contextLinks).toEqual([]);
    expect(nextUpload.omittedLinkUrls).toEqual(expect.arrayContaining([listLink.url]));
  });
});

describe('stripVmStorageLinksFromUploads', () => {
  it('should remove VM storage links from canceled uploads for the deleted VM', () => {
    const uploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, DISK_NAME);
    const uploadsData = createUploadsData(uploadKey, createCanceledUpload());

    const nextUploads = stripVmStorageLinksFromUploads(uploadsData, CLUSTER, NAMESPACE, VM_NAME);

    expect(nextUploads[uploadKey].progressToastState.contextLinks).toEqual([]);
    expect(nextUploads[uploadKey].progressToastState.successLinks).toEqual([]);
  });

  it('should remove VM storage links from canceled CD-ROM uploads for the deleted VM', () => {
    const uploadKey = getVmCdromUploadKey(CLUSTER, NAMESPACE, VM_NAME, DISK_NAME);
    const uploadsData = createUploadsData(uploadKey, {
      ...createCanceledUpload(),
      contextLinks: [storageLink],
      successLinks: [storageLink],
    });

    const nextUploads = stripVmStorageLinksFromUploads(uploadsData, CLUSTER, NAMESPACE, VM_NAME);

    expect(nextUploads[uploadKey].progressToastState.contextLinks).toEqual([]);
    expect(nextUploads[uploadKey].progressToastState.successLinks).toEqual([]);
  });

  it('should not change uploads for a different VM', () => {
    const uploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, 'other-vm', DISK_NAME);
    const uploadsData = createUploadsData(uploadKey, createCanceledUpload());

    expect(stripVmStorageLinksFromUploads(uploadsData, CLUSTER, NAMESPACE, VM_NAME)).toBe(
      uploadsData,
    );
  });
});

describe('stripLinksForDeletedDataVolume', () => {
  it('should remove DataVolume links from VM disk uploads', () => {
    const uploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, DISK_NAME);
    const uploadsData = createUploadsData(uploadKey, createCanceledUpload());

    const nextUploads = stripLinksForDeletedDataVolume(uploadsData, DV_NAME, NAMESPACE);

    expect(nextUploads[uploadKey].progressToastState.contextLinks).toEqual([storageLink]);
    expect(nextUploads[uploadKey].progressToastState.successLinks).toEqual([storageLink]);
  });

  it('should remove the bootable volume success link when its DataVolume is deleted', () => {
    const volumeName = 'fedora-volume';
    const uploadKey = getBootableVolumeUploadKey(NAMESPACE, volumeName);
    const bootableVolumeLink = {
      label: 'View bootable volume',
      url: getBootableVolumeUrl(volumeName, NAMESPACE),
    };
    const uploadsData = createUploadsData(uploadKey, {
      dvName: volumeName,
      dvNamespace: NAMESPACE,
      progress: 100,
      status: UPLOAD_PROGRESS_STATUS.SUCCESS,
      successLinks: [bootableVolumeLink],
    });

    const nextUploads = stripLinksForDeletedDataVolume(uploadsData, volumeName, NAMESPACE);

    expect(nextUploads[uploadKey].progressToastState.successLinks).toEqual([]);
  });

  it('should not strip DataVolume links from a same-name upload on another cluster', () => {
    const uploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, DISK_NAME);
    const uploadsData = createUploadsData(uploadKey, {
      ...createCanceledUpload(),
      dvCluster: CLUSTER,
    });

    expect(stripLinksForDeletedDataVolume(uploadsData, DV_NAME, NAMESPACE, 'other-cluster')).toBe(
      uploadsData,
    );
  });

  it('should only strip the matching cluster when same-name DataVolumes exist on different clusters', () => {
    const remoteCluster = 'remote-cluster';
    const localKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, DISK_NAME);
    const remoteKey = getVmDiskUploadKey(remoteCluster, NAMESPACE, VM_NAME, DISK_NAME);
    const uploadsData: UploadsStoreSliceData = {
      ...createUploadsData(localKey, { ...createCanceledUpload(), dvCluster: CLUSTER }),
      ...createUploadsData(remoteKey, { ...createCanceledUpload(), dvCluster: remoteCluster }),
    };

    const nextUploads = stripLinksForDeletedDataVolume(uploadsData, DV_NAME, NAMESPACE, CLUSTER);

    expect(nextUploads[localKey].progressToastState.contextLinks).toEqual([storageLink]);
    expect(nextUploads[localKey].progressToastState.successLinks).toEqual([storageLink]);
    expect(nextUploads[remoteKey]).toEqual(uploadsData[remoteKey]);
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
    const uploadsData = createUploadsData(uploadKey, {
      progress: 100,
      status: UPLOAD_PROGRESS_STATUS.SUCCESS,
      successLinks: [bootableVolumeLink],
    });

    const nextUploads = stripLinksForDeletedBootableVolume(uploadsData, NAMESPACE, volumeName);

    expect(nextUploads[uploadKey].progressToastState.successLinks).toEqual([]);
  });

  it('should not strip a bootable volume upload on another cluster', () => {
    const volumeName = 'fedora-volume';
    const uploadKey = getBootableVolumeUploadKey(NAMESPACE, volumeName, CLUSTER);
    const bootableVolumeLink = {
      label: 'View bootable volume',
      url: getBootableVolumeUrl(volumeName, NAMESPACE, CLUSTER),
    };
    const uploadsData = createUploadsData(uploadKey, {
      dvCluster: CLUSTER,
      progress: 100,
      status: UPLOAD_PROGRESS_STATUS.SUCCESS,
      successLinks: [bootableVolumeLink],
    });

    expect(
      stripLinksForDeletedBootableVolume(uploadsData, NAMESPACE, volumeName, 'other-cluster'),
    ).toBe(uploadsData);
  });
});
