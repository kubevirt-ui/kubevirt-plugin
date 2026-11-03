import { cancelUploadPVC } from '@kubevirt-utils/hooks/useCDIUpload/utils';

import {
  getBootableVolumesListUrl,
  getBootableVolumeUrl,
  getDataVolumeUrl,
  getVmStorageUrlForIdentity,
} from './completion/uploadLinks';
import { UPLOAD_PROGRESS_STATUS } from './constants';
import { resetInFlightToastStore, useInFlightToastStore } from './inFlightToastStore';
import {
  getBootableVolumeUploadKey,
  getExportDiskUploadKey,
  getVmCdromUploadKey,
  getVmDiskUploadKey,
} from './keys/uploadKeys';

jest.mock('@kubevirt-utils/hooks/useCDIUpload/utils', () => ({
  cancelUploadPVC: jest.fn(),
}));

const UPLOAD_KEY = 'test-upload-key';
const FILE_IMAGE_ISO = 'image.iso';
const MISSING_KEY = 'missing-key';
const ERROR_UPLOAD_FAILED = 'Upload failed';
const DISK_NAME = 'disk-1';
const TOAST_ID_1 = 'toast-1';
const TOAST_ID_2 = 'toast-2';
const ERROR_CANCEL_FAILED = 'cancel failed';
const DV_NAME = 'upload-dv';
const NAMESPACE = 'default';
const CLUSTER = 'local-cluster';
const VM_NAME = 'test-vm';
const VM_DISK_NAME = 'rootdisk';
const CDROM_NAME = 'cdrom-1';
const OTHER_VM_NAME = 'other-vm';
const BOOTABLE_VOLUME_NAMESPACE = 'openshift-virtualization-os-images';
const BOOTABLE_VOLUME_NAME = 'fedora-40';
const LINK_LABEL_VIEW_DISK = 'View disk';
const LINK_URL_DISK = '/disk';
const LINK_LABEL_EXISTING = 'Existing link';
const LINK_URL_EXISTING = '/existing';

const resetStore = (): void => {
  resetInFlightToastStore();
};

describe('useUploadProgressStore', () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  afterEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  describe('startUpload', () => {
    it('should initialize entry with UPLOADING status and progress 0', () => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      const upload = useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY);

      expect(upload).toEqual({
        blockNavigation: true,
        fileName: FILE_IMAGE_ISO,
        generation: 1,
        progress: 0,
        status: UPLOAD_PROGRESS_STATUS.UPLOADING,
      });
    });

    it('should keep incrementing generation after the upload entry is removed', () => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
      useInFlightToastStore.getState().uploads.actions?.removeUpload(UPLOAD_KEY);

      const generation = useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      expect(generation).toBe(2);
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY)?.generation,
      ).toBe(2);
    });
  });

  describe('updateProgress', () => {
    it('should update progress when status is UPLOADING', () => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      useInFlightToastStore.getState().uploads.actions?.updateProgress(UPLOAD_KEY, 50);

      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY)?.progress,
      ).toBe(50);
    });

    it('should not update progress when status is terminal', () => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
      useInFlightToastStore.getState().uploads.actions?.completeUpload(UPLOAD_KEY);

      useInFlightToastStore.getState().uploads.actions?.updateProgress(UPLOAD_KEY, 50);

      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY)?.progress,
      ).toBe(100);
    });

    it('should no-op when upload key does not exist', () => {
      useInFlightToastStore.getState().uploads.actions?.updateProgress(MISSING_KEY, 50);

      expect(useInFlightToastStore.getState().uploads.data).toEqual({});
    });
  });

  describe('completeUpload', () => {
    it('should set SUCCESS status, progress 100, and merge successLinks and resourceName', () => {
      useInFlightToastStore.getState().uploads.actions?.startUpload(UPLOAD_KEY, {
        fileName: FILE_IMAGE_ISO,
        successLinks: [{ label: LINK_LABEL_EXISTING, url: LINK_URL_EXISTING }],
      });

      useInFlightToastStore.getState().uploads.actions?.completeUpload(UPLOAD_KEY, {
        resourceName: DISK_NAME,
        successLinks: [{ label: LINK_LABEL_VIEW_DISK, url: LINK_URL_DISK }],
      });

      const upload = useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY);

      expect(upload).toMatchObject({
        progress: 100,
        resourceName: DISK_NAME,
        status: UPLOAD_PROGRESS_STATUS.SUCCESS,
        successLinks: [{ label: LINK_LABEL_VIEW_DISK, url: LINK_URL_DISK }],
      });
    });

    it('should no-op when upload key does not exist', () => {
      useInFlightToastStore.getState().uploads.actions?.completeUpload(MISSING_KEY);

      expect(useInFlightToastStore.getState().uploads.data).toEqual({});
    });

    it('should not overwrite a canceled upload', () => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
      useInFlightToastStore.getState().uploads.actions?.markUploadCanceled(UPLOAD_KEY);

      useInFlightToastStore.getState().uploads.actions?.completeUpload(UPLOAD_KEY, {
        successLinks: [{ label: LINK_LABEL_VIEW_DISK, url: LINK_URL_DISK }],
      });

      const upload = useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY);
      expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.CANCELED);
      expect(upload?.successLinks).toBeUndefined();
    });

    it('should not overwrite a retried upload with a stale generation', () => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      useInFlightToastStore.getState().uploads.actions?.completeUpload(UPLOAD_KEY, {
        expectedGeneration: 1,
        successLinks: [{ label: LINK_LABEL_VIEW_DISK, url: LINK_URL_DISK }],
      });

      const upload = useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY);
      expect(upload?.generation).toBe(2);
      expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
      expect(upload?.successLinks).toBeUndefined();
    });

    it('should omit success links that were stripped before completion', () => {
      const omittedUrl = '/k8s/ns/default/datavolumes/dv-disk-0';
      useInFlightToastStore.getState().uploads.actions?.startUpload(UPLOAD_KEY, {
        fileName: FILE_IMAGE_ISO,
        omittedLinkUrls: [omittedUrl],
      });

      useInFlightToastStore.getState().uploads.actions?.completeUpload(UPLOAD_KEY, {
        successLinks: [
          { label: LINK_LABEL_VIEW_DISK, url: LINK_URL_DISK },
          { label: 'View DataVolume', url: omittedUrl },
        ],
      });

      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY)?.successLinks,
      ).toEqual([{ label: LINK_LABEL_VIEW_DISK, url: LINK_URL_DISK }]);
    });
  });

  describe('failUpload', () => {
    it('should set ERROR status and store error message', () => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      useInFlightToastStore.getState().uploads.actions?.failUpload(UPLOAD_KEY, ERROR_UPLOAD_FAILED);

      expect(useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY)).toMatchObject(
        {
          errorMessage: ERROR_UPLOAD_FAILED,
          status: UPLOAD_PROGRESS_STATUS.ERROR,
        },
      );
    });

    it('should no-op when upload key does not exist', () => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.failUpload(MISSING_KEY, ERROR_UPLOAD_FAILED);

      expect(useInFlightToastStore.getState().uploads.data).toEqual({});
    });

    it('should not overwrite a canceled upload', () => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
      useInFlightToastStore.getState().uploads.actions?.markUploadCanceled(UPLOAD_KEY);

      useInFlightToastStore.getState().uploads.actions?.failUpload(UPLOAD_KEY, ERROR_UPLOAD_FAILED);

      const upload = useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY);
      expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.CANCELED);
      expect(upload?.errorMessage).toBeUndefined();
    });

    it('should not overwrite a retried upload with a stale generation', () => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      useInFlightToastStore
        .getState()
        .uploads.actions?.failUpload(UPLOAD_KEY, ERROR_UPLOAD_FAILED, 1);

      const upload = useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY);
      expect(upload?.generation).toBe(2);
      expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
      expect(upload?.errorMessage).toBeUndefined();
    });

    it('should not fail a later upload after the previous entry was removed', () => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
      useInFlightToastStore.getState().uploads.actions?.removeUpload(UPLOAD_KEY);
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      useInFlightToastStore
        .getState()
        .uploads.actions?.failUpload(UPLOAD_KEY, ERROR_UPLOAD_FAILED, 1);

      const upload = useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY);
      expect(upload?.generation).toBe(2);
      expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
      expect(upload?.errorMessage).toBeUndefined();
    });
  });

  describe('markUploadCanceled', () => {
    it('should set CANCELED status', () => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      useInFlightToastStore.getState().uploads.actions?.markUploadCanceled(UPLOAD_KEY);

      expect(useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY)?.status).toBe(
        UPLOAD_PROGRESS_STATUS.CANCELED,
      );
    });

    it('should no-op when upload key does not exist', () => {
      useInFlightToastStore.getState().uploads.actions?.markUploadCanceled(MISSING_KEY);

      expect(useInFlightToastStore.getState().uploads.data).toEqual({});
    });

    it('should not cancel a later upload with a stale generation', () => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
      useInFlightToastStore.getState().uploads.actions?.removeUpload(UPLOAD_KEY);
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      useInFlightToastStore.getState().uploads.actions?.markUploadCanceled(UPLOAD_KEY, 1);

      expect(useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY)?.status).toBe(
        UPLOAD_PROGRESS_STATUS.UPLOADING,
      );
    });
  });

  describe('removeUpload', () => {
    it('should delete the upload entry', () => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      useInFlightToastStore.getState().uploads.actions?.removeUpload(UPLOAD_KEY);

      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY),
      ).toBeUndefined();
    });
  });

  describe('trySetToastId', () => {
    it('should set toastId on first call and return true', () => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      const result = useInFlightToastStore
        .getState()
        .uploads.actions?.trySetToastId(UPLOAD_KEY, TOAST_ID_1);

      expect(result).toBe(true);
      expect(useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY)?.toastId).toBe(
        TOAST_ID_1,
      );
    });

    it('should return false when toastId is already set', () => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
      useInFlightToastStore.getState().uploads.actions?.trySetToastId(UPLOAD_KEY, TOAST_ID_1);

      const result = useInFlightToastStore
        .getState()
        .uploads.actions?.trySetToastId(UPLOAD_KEY, TOAST_ID_2);

      expect(result).toBe(false);
      expect(useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY)?.toastId).toBe(
        TOAST_ID_1,
      );
    });
  });

  describe('tryMarkTerminalToastShown', () => {
    it('should mark terminal toast shown on first call and return true', () => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      const result = useInFlightToastStore
        .getState()
        .uploads.actions?.tryMarkTerminalToastShown(UPLOAD_KEY);

      expect(result).toBe(true);
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY)?.terminalToastShown,
      ).toBe(true);
    });

    it('should return false on second call', () => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
      useInFlightToastStore.getState().uploads.actions?.tryMarkTerminalToastShown(UPLOAD_KEY);

      const result = useInFlightToastStore
        .getState()
        .uploads.actions?.tryMarkTerminalToastShown(UPLOAD_KEY);

      expect(result).toBe(false);
    });
  });

  describe('cancelTrackedUpload', () => {
    it('should call cancelUpload, mark canceled, and run onCancelCleanup in order', async () => {
      const callOrder: string[] = [];
      const cancelUpload = jest.fn(async () => {
        callOrder.push('cancelUpload');
      });
      const onCancelCleanup = jest.fn(async () => {
        callOrder.push('onCancelCleanup');
      });

      useInFlightToastStore.getState().uploads.actions?.startUpload(UPLOAD_KEY, {
        cancelUpload,
        fileName: FILE_IMAGE_ISO,
        onCancelCleanup,
      });

      await useInFlightToastStore.getState().uploads.actions?.cancelTrackedUpload(UPLOAD_KEY);

      expect(cancelUpload).toHaveBeenCalledTimes(1);
      expect(onCancelCleanup).toHaveBeenCalledTimes(1);
      expect(callOrder).toEqual(['cancelUpload', 'onCancelCleanup']);
      expect(useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY)?.status).toBe(
        UPLOAD_PROGRESS_STATUS.CANCELED,
      );
    });

    it('should fall back to cancelUploadPVC when cancelUpload fails', async () => {
      const cancelUpload = jest.fn(async () => {
        throw new Error(ERROR_CANCEL_FAILED);
      });

      useInFlightToastStore.getState().uploads.actions?.startUpload(UPLOAD_KEY, {
        cancelUpload,
        dvCluster: CLUSTER,
        dvName: DV_NAME,
        dvNamespace: NAMESPACE,
        fileName: FILE_IMAGE_ISO,
      });

      await useInFlightToastStore.getState().uploads.actions?.cancelTrackedUpload(UPLOAD_KEY);

      expect(cancelUploadPVC).toHaveBeenCalledWith(DV_NAME, NAMESPACE, CLUSTER);
      expect(useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY)?.status).toBe(
        UPLOAD_PROGRESS_STATUS.CANCELED,
      );
    });

    it('should treat 404 from cancelUploadPVC as successful cancellation', async () => {
      const cancelUpload = jest.fn(async () => {
        throw new Error(ERROR_CANCEL_FAILED);
      });
      (cancelUploadPVC as jest.Mock).mockRejectedValueOnce({ code: 404 });

      useInFlightToastStore.getState().uploads.actions?.startUpload(UPLOAD_KEY, {
        cancelUpload,
        dvCluster: CLUSTER,
        dvName: DV_NAME,
        dvNamespace: NAMESPACE,
        fileName: FILE_IMAGE_ISO,
      });

      await useInFlightToastStore.getState().uploads.actions?.cancelTrackedUpload(UPLOAD_KEY);

      expect(cancelUploadPVC).toHaveBeenCalledWith(DV_NAME, NAMESPACE, CLUSTER);
      expect(useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY)?.status).toBe(
        UPLOAD_PROGRESS_STATUS.CANCELED,
      );
    });

    it('should strip DataVolume links when cancellation succeeds', async () => {
      const dataVolumeLink = {
        label: 'View DataVolume',
        url: getDataVolumeUrl(DV_NAME, NAMESPACE),
      };
      const storageLink = { label: LINK_LABEL_VIEW_DISK, url: LINK_URL_DISK };
      const cancelUpload = jest.fn(async () => undefined);

      useInFlightToastStore.getState().uploads.actions?.startUpload(UPLOAD_KEY, {
        cancelUpload,
        contextLinks: [storageLink, dataVolumeLink],
        dvName: DV_NAME,
        dvNamespace: NAMESPACE,
        fileName: FILE_IMAGE_ISO,
      });

      await useInFlightToastStore.getState().uploads.actions?.cancelTrackedUpload(UPLOAD_KEY);

      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY)?.contextLinks,
      ).toEqual([storageLink]);
    });

    it('should strip the bootable volumes list link when a bootable volume upload is aborted', async () => {
      const uploadKey = getBootableVolumeUploadKey(BOOTABLE_VOLUME_NAMESPACE, BOOTABLE_VOLUME_NAME);
      const listLink = {
        label: 'Bootable volume fedora-40',
        url: getBootableVolumesListUrl(BOOTABLE_VOLUME_NAMESPACE),
      };
      const cancelUpload = jest.fn(async () => undefined);

      useInFlightToastStore.getState().uploads.actions?.startUpload(uploadKey, {
        cancelUpload,
        contextLinks: [listLink],
        dvName: BOOTABLE_VOLUME_NAME,
        dvNamespace: BOOTABLE_VOLUME_NAMESPACE,
        fileName: FILE_IMAGE_ISO,
      });

      await useInFlightToastStore.getState().uploads.actions?.cancelTrackedUpload(uploadKey);

      const upload = useInFlightToastStore.getState().uploads.actions?.getUpload(uploadKey);
      expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.CANCELED);
      expect(upload?.contextLinks).toEqual([]);
      expect(upload?.omittedLinkUrls).toEqual(expect.arrayContaining([listLink.url]));
    });

    it('should no-op when upload key does not exist', async () => {
      await useInFlightToastStore.getState().uploads.actions?.cancelTrackedUpload(MISSING_KEY);

      expect(cancelUploadPVC).not.toHaveBeenCalled();
    });

    it('should not cancel a retried upload after the original abort completes', async () => {
      let resolveCancel: () => void = () => undefined;
      const cancelUpload = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveCancel = resolve;
          }),
      );

      useInFlightToastStore.getState().uploads.actions?.startUpload(UPLOAD_KEY, {
        cancelUpload,
        fileName: FILE_IMAGE_ISO,
      });

      const cancelPromise = useInFlightToastStore
        .getState()
        .uploads.actions?.cancelTrackedUpload(UPLOAD_KEY);
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: 'retry.iso' });

      resolveCancel();
      await cancelPromise;

      const upload = useInFlightToastStore.getState().uploads.actions?.getUpload(UPLOAD_KEY);
      expect(upload?.fileName).toBe('retry.iso');
      expect(upload?.generation).toBe(2);
      expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
    });
  });

  describe('cancelUploadsForVm', () => {
    it('should cancel all vm-disk and vm-cdrom uploads for the VM', async () => {
      const diskUploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, VM_DISK_NAME);
      const cdromUploadKey = getVmCdromUploadKey(CLUSTER, NAMESPACE, VM_NAME, CDROM_NAME);
      const bootableVolumeUploadKey = getBootableVolumeUploadKey(
        BOOTABLE_VOLUME_NAMESPACE,
        BOOTABLE_VOLUME_NAME,
      );
      const otherVmUploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, OTHER_VM_NAME, VM_DISK_NAME);
      const diskCancelUpload = jest.fn(async () => undefined);
      const cdromCancelUpload = jest.fn(async () => undefined);
      const bootableCancelUpload = jest.fn(async () => undefined);
      const otherVmCancelUpload = jest.fn(async () => undefined);

      useInFlightToastStore.getState().uploads.actions?.startUpload(diskUploadKey, {
        cancelUpload: diskCancelUpload,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().uploads.actions?.startUpload(cdromUploadKey, {
        cancelUpload: cdromCancelUpload,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().uploads.actions?.startUpload(bootableVolumeUploadKey, {
        cancelUpload: bootableCancelUpload,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().uploads.actions?.startUpload(otherVmUploadKey, {
        cancelUpload: otherVmCancelUpload,
        fileName: FILE_IMAGE_ISO,
      });

      await useInFlightToastStore
        .getState()
        .uploads.actions?.cancelUploadsForVm(CLUSTER, NAMESPACE, VM_NAME);

      expect(diskCancelUpload).toHaveBeenCalledTimes(1);
      expect(cdromCancelUpload).toHaveBeenCalledTimes(1);
      expect(bootableCancelUpload).not.toHaveBeenCalled();
      expect(otherVmCancelUpload).not.toHaveBeenCalled();
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(diskUploadKey)?.status,
      ).toBe(UPLOAD_PROGRESS_STATUS.CANCELED);
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(cdromUploadKey)?.status,
      ).toBe(UPLOAD_PROGRESS_STATUS.CANCELED);
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(bootableVolumeUploadKey)
          ?.status,
      ).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(otherVmUploadKey)?.status,
      ).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
    });

    it('should no-op when no uploads match the VM', async () => {
      await useInFlightToastStore
        .getState()
        .uploads.actions?.cancelUploadsForVm(CLUSTER, NAMESPACE, VM_NAME);

      expect(cancelUploadPVC).not.toHaveBeenCalled();
    });

    it('should not cancel completed uploads for the VM', async () => {
      const diskUploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, VM_DISK_NAME);
      const diskCancelUpload = jest.fn(async () => undefined);

      useInFlightToastStore.getState().uploads.actions?.startUpload(diskUploadKey, {
        cancelUpload: diskCancelUpload,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().uploads.actions?.completeUpload(diskUploadKey);

      await useInFlightToastStore
        .getState()
        .uploads.actions?.cancelUploadsForVm(CLUSTER, NAMESPACE, VM_NAME);

      expect(diskCancelUpload).not.toHaveBeenCalled();
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(diskUploadKey)?.status,
      ).toBe(UPLOAD_PROGRESS_STATUS.SUCCESS);
    });

    it('should strip VM storage and DataVolume links from an already-canceled upload when the VM is deleted', async () => {
      const diskUploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, VM_DISK_NAME);
      const storageUrl = getVmStorageUrlForIdentity(CLUSTER, NAMESPACE, VM_NAME);
      const dataVolumeLink = {
        label: 'View DataVolume',
        url: getDataVolumeUrl(DV_NAME, NAMESPACE),
      };

      useInFlightToastStore.getState().uploads.actions?.startUpload(diskUploadKey, {
        contextLinks: [{ label: 'View disk', url: storageUrl }, dataVolumeLink],
        dvName: DV_NAME,
        dvNamespace: NAMESPACE,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().uploads.actions?.markUploadCanceled(diskUploadKey);

      await useInFlightToastStore
        .getState()
        .uploads.actions?.cancelUploadsForVm(CLUSTER, NAMESPACE, VM_NAME);

      const upload = useInFlightToastStore.getState().uploads.actions?.getUpload(diskUploadKey);
      expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.CANCELED);
      expect(upload?.contextLinks).toEqual([]);
    });

    it('should cancel empty-cluster uploads when deleting an ACM fleet VM', async () => {
      const emptyClusterUploadKey = getVmDiskUploadKey('', NAMESPACE, VM_NAME, VM_DISK_NAME);
      const cancelUpload = jest.fn(async () => undefined);

      useInFlightToastStore.getState().uploads.actions?.startUpload(emptyClusterUploadKey, {
        cancelUpload,
        fileName: FILE_IMAGE_ISO,
      });

      await useInFlightToastStore
        .getState()
        .uploads.actions?.cancelUploadsForVm(CLUSTER, NAMESPACE, VM_NAME);

      expect(cancelUpload).toHaveBeenCalledTimes(1);
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(emptyClusterUploadKey)?.status,
      ).toBe(UPLOAD_PROGRESS_STATUS.CANCELED);
    });

    it('should strip the View storage link from an in-progress CD-ROM upload when the VM is deleted', async () => {
      const cdromUploadKey = getVmCdromUploadKey(CLUSTER, NAMESPACE, VM_NAME, CDROM_NAME);
      const storageUrl = getVmStorageUrlForIdentity(CLUSTER, NAMESPACE, VM_NAME);
      const cancelUpload = jest.fn(async () => undefined);

      useInFlightToastStore.getState().uploads.actions?.startUpload(cdromUploadKey, {
        cancelUpload,
        contextLinks: [{ label: 'View test-vm storage', url: storageUrl }],
        fileName: FILE_IMAGE_ISO,
      });

      await useInFlightToastStore
        .getState()
        .uploads.actions?.cancelUploadsForVm(CLUSTER, NAMESPACE, VM_NAME);

      const upload = useInFlightToastStore.getState().uploads.actions?.getUpload(cdromUploadKey);
      expect(cancelUpload).toHaveBeenCalledTimes(1);
      expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.CANCELED);
      expect(upload?.contextLinks).toEqual([]);
      expect(upload?.omittedLinkUrls).toEqual(expect.arrayContaining([storageUrl]));
    });

    it('should leave a same-key retry untouched when the original abort finishes after replacement', async () => {
      const cdromUploadKey = getVmCdromUploadKey(CLUSTER, NAMESPACE, VM_NAME, CDROM_NAME);
      const storageUrl = getVmStorageUrlForIdentity(CLUSTER, NAMESPACE, VM_NAME);
      let resolveCancel: () => void = () => undefined;
      const cancelUpload = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveCancel = resolve;
          }),
      );

      useInFlightToastStore.getState().uploads.actions?.startUpload(cdromUploadKey, {
        cancelUpload,
        contextLinks: [{ label: 'View test-vm storage', url: storageUrl }],
        fileName: FILE_IMAGE_ISO,
      });

      const cancelPromise = useInFlightToastStore
        .getState()
        .uploads.actions?.cancelUploadsForVm(CLUSTER, NAMESPACE, VM_NAME);

      useInFlightToastStore.getState().uploads.actions?.startUpload(cdromUploadKey, {
        contextLinks: [{ label: 'View test-vm storage', url: storageUrl }],
        fileName: 'retry.iso',
      });

      resolveCancel();
      await cancelPromise;

      const upload = useInFlightToastStore.getState().uploads.actions?.getUpload(cdromUploadKey);
      expect(upload?.fileName).toBe('retry.iso');
      expect(upload?.generation).toBe(2);
      expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
      expect(upload?.contextLinks).toEqual([{ label: 'View test-vm storage', url: storageUrl }]);
    });
  });

  describe('cancelWizardPendingUploads', () => {
    it('should cancel registered wizard uploads without canceling other VM uploads', async () => {
      const wizardDiskUploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, VM_DISK_NAME);
      const wizardCdromUploadKey = getVmCdromUploadKey(CLUSTER, NAMESPACE, VM_NAME, CDROM_NAME);
      const otherVmCdromUploadKey = getVmCdromUploadKey(
        CLUSTER,
        NAMESPACE,
        OTHER_VM_NAME,
        CDROM_NAME,
      );
      const bootableVolumeUploadKey = getBootableVolumeUploadKey(
        BOOTABLE_VOLUME_NAMESPACE,
        BOOTABLE_VOLUME_NAME,
      );
      const exportDiskUploadKey = getExportDiskUploadKey(CLUSTER, NAMESPACE, 'export-pvc');
      const wizardDiskCancel = jest.fn(async () => undefined);
      const wizardCdromCancel = jest.fn(async () => undefined);
      const otherVmCdromCancel = jest.fn(async () => undefined);
      const bootableCancel = jest.fn(async () => undefined);
      const exportDiskCancel = jest.fn(async () => undefined);

      useInFlightToastStore.getState().uploads.actions?.startUpload(wizardDiskUploadKey, {
        cancelUpload: wizardDiskCancel,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().uploads.actions?.startUpload(wizardCdromUploadKey, {
        cancelUpload: wizardCdromCancel,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().uploads.actions?.startUpload(otherVmCdromUploadKey, {
        cancelUpload: otherVmCdromCancel,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().uploads.actions?.startUpload(bootableVolumeUploadKey, {
        cancelUpload: bootableCancel,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().exportDisk.actions?.startUpload(exportDiskUploadKey, {
        cluster: CLUSTER,
        entry: {
          cancelUpload: exportDiskCancel,
          fileName: FILE_IMAGE_ISO,
        },
        pod: { metadata: { name: 'export-pod', namespace: NAMESPACE } } as never,
        pvcName: 'export-pvc',
        secretName: 'export-secret',
      });

      await useInFlightToastStore
        .getState()
        .uploads.actions?.cancelWizardPendingUploads([
          wizardDiskUploadKey,
          wizardCdromUploadKey,
          bootableVolumeUploadKey,
        ]);

      expect(wizardDiskCancel).toHaveBeenCalledTimes(1);
      expect(wizardCdromCancel).toHaveBeenCalledTimes(1);
      expect(bootableCancel).toHaveBeenCalledTimes(1);
      expect(otherVmCdromCancel).not.toHaveBeenCalled();
      expect(exportDiskCancel).not.toHaveBeenCalled();
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(wizardDiskUploadKey),
      ).toBeUndefined();
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(wizardCdromUploadKey),
      ).toBeUndefined();
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(bootableVolumeUploadKey),
      ).toBeUndefined();
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(otherVmCdromUploadKey)?.status,
      ).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
      expect(
        useInFlightToastStore.getState().exportDisk.actions?.getUpload(exportDiskUploadKey)?.status,
      ).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
    });

    it('should cancel bootable-volume uploads when no draft VM is provided', async () => {
      const bootableVolumeUploadKey = getBootableVolumeUploadKey(
        BOOTABLE_VOLUME_NAMESPACE,
        BOOTABLE_VOLUME_NAME,
      );
      const otherVmCdromUploadKey = getVmCdromUploadKey(
        CLUSTER,
        NAMESPACE,
        OTHER_VM_NAME,
        CDROM_NAME,
      );
      const bootableCancel = jest.fn(async () => undefined);
      const otherVmCdromCancel = jest.fn(async () => undefined);

      useInFlightToastStore.getState().uploads.actions?.startUpload(bootableVolumeUploadKey, {
        cancelUpload: bootableCancel,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().uploads.actions?.startUpload(otherVmCdromUploadKey, {
        cancelUpload: otherVmCdromCancel,
        fileName: FILE_IMAGE_ISO,
      });

      await useInFlightToastStore
        .getState()
        .uploads.actions?.cancelWizardPendingUploads([bootableVolumeUploadKey]);

      expect(bootableCancel).toHaveBeenCalledTimes(1);
      expect(otherVmCdromCancel).not.toHaveBeenCalled();
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(bootableVolumeUploadKey),
      ).toBeUndefined();
      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(otherVmCdromUploadKey)?.status,
      ).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
    });
  });

  describe('stripBootableVolumeLinks', () => {
    it('should remove the success link after the bootable volume is deleted', () => {
      const uploadKey = getBootableVolumeUploadKey(BOOTABLE_VOLUME_NAMESPACE, BOOTABLE_VOLUME_NAME);
      const volumeUrl = getBootableVolumeUrl(BOOTABLE_VOLUME_NAME, BOOTABLE_VOLUME_NAMESPACE);

      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(uploadKey, { fileName: FILE_IMAGE_ISO });
      useInFlightToastStore.getState().uploads.actions?.completeUpload(uploadKey, {
        successLinks: [{ label: 'View bootable volume', url: volumeUrl }],
      });

      useInFlightToastStore
        .getState()
        .uploads.actions?.stripBootableVolumeLinks(BOOTABLE_VOLUME_NAMESPACE, BOOTABLE_VOLUME_NAME);

      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(uploadKey)?.successLinks,
      ).toEqual([]);
    });
  });

  describe('stripDataVolumeLinksForResource', () => {
    it('should remove the bootable volume success link when its DataVolume is deleted', () => {
      const uploadKey = getBootableVolumeUploadKey(NAMESPACE, BOOTABLE_VOLUME_NAME);
      const volumeUrl = getBootableVolumeUrl(BOOTABLE_VOLUME_NAME, NAMESPACE);

      useInFlightToastStore.getState().uploads.actions?.startUpload(uploadKey, {
        dvName: DV_NAME,
        dvNamespace: NAMESPACE,
        fileName: FILE_IMAGE_ISO,
      });
      useInFlightToastStore.getState().uploads.actions?.completeUpload(uploadKey, {
        successLinks: [{ label: 'View bootable volume', url: volumeUrl }],
      });

      useInFlightToastStore
        .getState()
        .uploads.actions?.stripDataVolumeLinksForResource(DV_NAME, NAMESPACE);

      expect(
        useInFlightToastStore.getState().uploads.actions?.getUpload(uploadKey)?.successLinks,
      ).toEqual([]);
    });
  });
});
