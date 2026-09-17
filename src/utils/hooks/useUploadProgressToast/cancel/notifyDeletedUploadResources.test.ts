import { UPLOAD_PROGRESS_STATUS } from '../constants';
import { useUploadProgressStore } from '../uploadProgressStore';

import { getBootableVolumeUrl } from '../completion/uploadLinks';
import { getBootableVolumeUploadKey } from '../keys/uploadKeys';
import {
  notifyBootableVolumeDeleted,
  notifyDataVolumeDeleted,
} from './notifyDeletedUploadResources';

const NAMESPACE = 'default';
const VOLUME_NAME = 'fedora-volume';

const resetStore = (): void => {
  useUploadProgressStore.setState({ generationsByKey: {}, uploads: {} });
};

describe('notifyDeletedUploadResources', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    resetStore();
  });

  it('should strip the bootable volume success link when the volume is deleted', () => {
    const uploadKey = getBootableVolumeUploadKey(NAMESPACE, VOLUME_NAME);
    const volumeUrl = getBootableVolumeUrl(VOLUME_NAME, NAMESPACE);

    useUploadProgressStore.getState().startUpload(uploadKey, { fileName: 'image.iso' });
    useUploadProgressStore.getState().completeUpload(uploadKey, {
      successLinks: [{ label: 'View bootable volume', url: volumeUrl }],
    });

    notifyBootableVolumeDeleted(VOLUME_NAME, NAMESPACE);

    expect(useUploadProgressStore.getState().getUpload(uploadKey)?.successLinks).toEqual([]);
    expect(useUploadProgressStore.getState().getUpload(uploadKey)?.status).toBe(
      UPLOAD_PROGRESS_STATUS.SUCCESS,
    );
  });

  it('should strip the bootable volume success link when its DataVolume is deleted', () => {
    const uploadKey = getBootableVolumeUploadKey(NAMESPACE, VOLUME_NAME);
    const volumeUrl = getBootableVolumeUrl(VOLUME_NAME, NAMESPACE);

    useUploadProgressStore.getState().startUpload(uploadKey, {
      dvName: VOLUME_NAME,
      dvNamespace: NAMESPACE,
      fileName: 'image.iso',
    });
    useUploadProgressStore.getState().completeUpload(uploadKey, {
      successLinks: [{ label: 'View bootable volume', url: volumeUrl }],
    });

    notifyDataVolumeDeleted(VOLUME_NAME, NAMESPACE);

    expect(useUploadProgressStore.getState().getUpload(uploadKey)?.successLinks).toEqual([]);
  });

  it('should only strip the matching cluster when same-name DataVolumes exist on different clusters', () => {
    const localCluster = 'local-cluster';
    const remoteCluster = 'remote-cluster';
    const localKey = getBootableVolumeUploadKey(NAMESPACE, VOLUME_NAME, localCluster);
    const remoteKey = getBootableVolumeUploadKey(NAMESPACE, VOLUME_NAME, remoteCluster);
    const volumeUrl = getBootableVolumeUrl(VOLUME_NAME, NAMESPACE);

    useUploadProgressStore.getState().startUpload(localKey, {
      dvCluster: localCluster,
      dvName: VOLUME_NAME,
      dvNamespace: NAMESPACE,
      fileName: 'image.iso',
    });
    useUploadProgressStore.getState().completeUpload(localKey, {
      successLinks: [{ label: 'View bootable volume', url: volumeUrl }],
    });
    useUploadProgressStore.getState().startUpload(remoteKey, {
      dvCluster: remoteCluster,
      dvName: VOLUME_NAME,
      dvNamespace: NAMESPACE,
      fileName: 'image.iso',
    });
    useUploadProgressStore.getState().completeUpload(remoteKey, {
      successLinks: [{ label: 'View bootable volume', url: volumeUrl }],
    });

    notifyDataVolumeDeleted(VOLUME_NAME, NAMESPACE, localCluster);

    expect(useUploadProgressStore.getState().getUpload(localKey)?.successLinks).toEqual([]);
    expect(useUploadProgressStore.getState().getUpload(remoteKey)?.successLinks).toEqual([
      { label: 'View bootable volume', url: volumeUrl },
    ]);
  });

  it('should no-op when name or namespace is missing', () => {
    notifyBootableVolumeDeleted(undefined, NAMESPACE);
    notifyDataVolumeDeleted(VOLUME_NAME, undefined);

    expect(useUploadProgressStore.getState().uploads).toEqual({});
  });
});
