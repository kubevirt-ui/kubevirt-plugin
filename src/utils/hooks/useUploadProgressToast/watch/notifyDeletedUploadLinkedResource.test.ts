import {
  DataSourceModel,
  DataVolumeModel,
  VirtualMachineModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';

import { UPLOAD_PROGRESS_STATUS } from '../constants';
import { useUploadProgressStore } from '../uploadProgressStore';

import { getUploadLinkedResource } from '../completion/uploadLinkedResource';
import {
  getBootableVolumeUrl,
  getDataVolumeUrl,
  getVmStorageUrlForIdentity,
} from '../completion/uploadLinks';
import { getBootableVolumeUploadKey, getVmDiskUploadKey } from '../keys/uploadKeys';
import {
  isUploadLinkedResourceGone,
  notifyDeletedUploadLinkedResource,
} from './notifyDeletedUploadLinkedResource';

const CLUSTER = 'local-cluster';
const NAMESPACE = 'default';
const VM_NAME = 'test-vm';
const DISK_NAME = 'disk-0';
const DV_NAME = 'dv-disk-0';
const VOLUME_NAME = 'fedora-volume';

const storageUrl = getVmStorageUrlForIdentity(CLUSTER, NAMESPACE, VM_NAME);
const storageLink = { label: 'View disk', url: storageUrl };

const resetStore = (): void => {
  useUploadProgressStore.setState({ generationsByKey: {}, uploads: {} });
};

describe('isUploadLinkedResourceGone', () => {
  it('should be false until the watch has loaded', () => {
    expect(isUploadLinkedResourceGone(undefined, false, { code: 404 })).toBe(false);
  });

  it('should be false for a not-found error before the resource was observed', () => {
    expect(isUploadLinkedResourceGone(undefined, true, { code: 404 })).toBe(false);
  });

  it('should be true for a not-found error after the resource was observed alive', () => {
    expect(isUploadLinkedResourceGone(undefined, true, { code: 404 }, true)).toBe(true);
  });

  it('should be true when the resource has a deletionTimestamp', () => {
    expect(
      isUploadLinkedResourceGone(
        { metadata: { deletionTimestamp: '2026-09-17T12:00:00Z', name: VM_NAME } },
        true,
        undefined,
      ),
    ).toBe(true);
  });

  it('should be false for a healthy resource', () => {
    expect(isUploadLinkedResourceGone({ metadata: { name: VM_NAME } }, true, undefined)).toBe(
      false,
    );
  });

  it('should be false for a non-404 watch error', () => {
    expect(isUploadLinkedResourceGone(undefined, true, { code: 403 })).toBe(false);
  });
});

describe('notifyDeletedUploadLinkedResource', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    resetStore();
  });

  it('should strip VM storage links without canceling the upload', () => {
    const uploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, DISK_NAME);
    useUploadProgressStore.getState().startUpload(uploadKey, {
      contextLinks: [storageLink],
      fileName: 'image.iso',
    });

    notifyDeletedUploadLinkedResource(
      getUploadLinkedResource(VirtualMachineModel, VM_NAME, NAMESPACE, CLUSTER),
    );

    const upload = useUploadProgressStore.getState().getUpload(uploadKey);
    expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
    expect(upload?.contextLinks).toEqual([]);
  });

  it('should strip DataVolume links', () => {
    const uploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, DISK_NAME);
    const dataVolumeUrl = getDataVolumeUrl(DV_NAME, NAMESPACE, CLUSTER);
    useUploadProgressStore.getState().startUpload(uploadKey, {
      contextLinks: [storageLink, { label: 'View DataVolume', url: dataVolumeUrl }],
      dvCluster: CLUSTER,
      dvName: DV_NAME,
      dvNamespace: NAMESPACE,
      fileName: 'image.iso',
    });

    notifyDeletedUploadLinkedResource(
      getUploadLinkedResource(DataVolumeModel, DV_NAME, NAMESPACE, CLUSTER),
    );

    expect(useUploadProgressStore.getState().getUpload(uploadKey)?.contextLinks).toEqual([
      storageLink,
    ]);
  });

  it('should strip bootable volume links', () => {
    const uploadKey = getBootableVolumeUploadKey(NAMESPACE, VOLUME_NAME, CLUSTER);
    const volumeUrl = getBootableVolumeUrl(VOLUME_NAME, NAMESPACE, CLUSTER);
    useUploadProgressStore.getState().startUpload(uploadKey, {
      dvCluster: CLUSTER,
      fileName: 'image.iso',
    });
    useUploadProgressStore.getState().completeUpload(uploadKey, {
      successLinks: [{ label: 'View bootable volume', url: volumeUrl }],
    });

    notifyDeletedUploadLinkedResource(
      getUploadLinkedResource(DataSourceModel, VOLUME_NAME, NAMESPACE, CLUSTER),
    );

    expect(useUploadProgressStore.getState().getUpload(uploadKey)?.successLinks).toEqual([]);
  });
});
