import { cancelUploadPVC } from '@kubevirt-utils/hooks/useCDIUpload/utils';

import {
  getBootableVolumeUploadKey,
  getVmCdromUploadKey,
  getVmDiskUploadKey,
} from './keys/uploadKeys';
import { UPLOAD_PROGRESS_STATUS } from './constants';
import { useUploadProgressStore } from './uploadProgressStore';

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
  useUploadProgressStore.setState({ uploads: {} });
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
      useUploadProgressStore.getState().startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      const upload = useUploadProgressStore.getState().getUpload(UPLOAD_KEY);

      expect(upload).toEqual({
        blockNavigation: true,
        fileName: FILE_IMAGE_ISO,
        progress: 0,
        status: UPLOAD_PROGRESS_STATUS.UPLOADING,
      });
    });
  });

  describe('updateProgress', () => {
    it('should update progress when status is UPLOADING', () => {
      useUploadProgressStore.getState().startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      useUploadProgressStore.getState().updateProgress(UPLOAD_KEY, 50);

      expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)?.progress).toBe(50);
    });

    it('should not update progress when status is terminal', () => {
      useUploadProgressStore.getState().startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
      useUploadProgressStore.getState().completeUpload(UPLOAD_KEY);

      useUploadProgressStore.getState().updateProgress(UPLOAD_KEY, 50);

      expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)?.progress).toBe(100);
    });

    it('should no-op when upload key does not exist', () => {
      useUploadProgressStore.getState().updateProgress(MISSING_KEY, 50);

      expect(useUploadProgressStore.getState().uploads).toEqual({});
    });
  });

  describe('completeUpload', () => {
    it('should set SUCCESS status, progress 100, and merge successLinks and resourceName', () => {
      useUploadProgressStore.getState().startUpload(UPLOAD_KEY, {
        fileName: FILE_IMAGE_ISO,
        successLinks: [{ label: LINK_LABEL_EXISTING, url: LINK_URL_EXISTING }],
      });

      useUploadProgressStore.getState().completeUpload(UPLOAD_KEY, {
        resourceName: DISK_NAME,
        successLinks: [{ label: LINK_LABEL_VIEW_DISK, url: LINK_URL_DISK }],
      });

      const upload = useUploadProgressStore.getState().getUpload(UPLOAD_KEY);

      expect(upload).toMatchObject({
        progress: 100,
        resourceName: DISK_NAME,
        status: UPLOAD_PROGRESS_STATUS.SUCCESS,
        successLinks: [{ label: LINK_LABEL_VIEW_DISK, url: LINK_URL_DISK }],
      });
    });

    it('should no-op when upload key does not exist', () => {
      useUploadProgressStore.getState().completeUpload(MISSING_KEY);

      expect(useUploadProgressStore.getState().uploads).toEqual({});
    });
  });

  describe('failUpload', () => {
    it('should set ERROR status and store error message', () => {
      useUploadProgressStore.getState().startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      useUploadProgressStore.getState().failUpload(UPLOAD_KEY, ERROR_UPLOAD_FAILED);

      expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)).toMatchObject({
        errorMessage: ERROR_UPLOAD_FAILED,
        status: UPLOAD_PROGRESS_STATUS.ERROR,
      });
    });

    it('should no-op when upload key does not exist', () => {
      useUploadProgressStore.getState().failUpload(MISSING_KEY, ERROR_UPLOAD_FAILED);

      expect(useUploadProgressStore.getState().uploads).toEqual({});
    });
  });

  describe('markUploadCanceled', () => {
    it('should set CANCELED status', () => {
      useUploadProgressStore.getState().startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      useUploadProgressStore.getState().markUploadCanceled(UPLOAD_KEY);

      expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)?.status).toBe(
        UPLOAD_PROGRESS_STATUS.CANCELED,
      );
    });

    it('should no-op when upload key does not exist', () => {
      useUploadProgressStore.getState().markUploadCanceled(MISSING_KEY);

      expect(useUploadProgressStore.getState().uploads).toEqual({});
    });
  });

  describe('removeUpload', () => {
    it('should delete the upload entry', () => {
      useUploadProgressStore.getState().startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      useUploadProgressStore.getState().removeUpload(UPLOAD_KEY);

      expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)).toBeUndefined();
    });
  });

  describe('trySetToastId', () => {
    it('should set toastId on first call and return true', () => {
      useUploadProgressStore.getState().startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      const result = useUploadProgressStore.getState().trySetToastId(UPLOAD_KEY, TOAST_ID_1);

      expect(result).toBe(true);
      expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)?.toastId).toBe(TOAST_ID_1);
    });

    it('should return false when toastId is already set', () => {
      useUploadProgressStore.getState().startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
      useUploadProgressStore.getState().trySetToastId(UPLOAD_KEY, TOAST_ID_1);

      const result = useUploadProgressStore.getState().trySetToastId(UPLOAD_KEY, TOAST_ID_2);

      expect(result).toBe(false);
      expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)?.toastId).toBe(TOAST_ID_1);
    });
  });

  describe('tryMarkTerminalToastShown', () => {
    it('should mark terminal toast shown on first call and return true', () => {
      useUploadProgressStore.getState().startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      const result = useUploadProgressStore.getState().tryMarkTerminalToastShown(UPLOAD_KEY);

      expect(result).toBe(true);
      expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)?.terminalToastShown).toBe(
        true,
      );
    });

    it('should return false on second call', () => {
      useUploadProgressStore.getState().startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
      useUploadProgressStore.getState().tryMarkTerminalToastShown(UPLOAD_KEY);

      const result = useUploadProgressStore.getState().tryMarkTerminalToastShown(UPLOAD_KEY);

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

      useUploadProgressStore.getState().startUpload(UPLOAD_KEY, {
        cancelUpload,
        fileName: FILE_IMAGE_ISO,
        onCancelCleanup,
      });

      await useUploadProgressStore.getState().cancelTrackedUpload(UPLOAD_KEY);

      expect(cancelUpload).toHaveBeenCalledTimes(1);
      expect(onCancelCleanup).toHaveBeenCalledTimes(1);
      expect(callOrder).toEqual(['cancelUpload', 'onCancelCleanup']);
      expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)?.status).toBe(
        UPLOAD_PROGRESS_STATUS.CANCELED,
      );
    });

    it('should fall back to cancelUploadPVC when cancelUpload fails', async () => {
      const cancelUpload = jest.fn(async () => {
        throw new Error(ERROR_CANCEL_FAILED);
      });

      useUploadProgressStore.getState().startUpload(UPLOAD_KEY, {
        cancelUpload,
        dvCluster: CLUSTER,
        dvName: DV_NAME,
        dvNamespace: NAMESPACE,
        fileName: FILE_IMAGE_ISO,
      });

      await useUploadProgressStore.getState().cancelTrackedUpload(UPLOAD_KEY);

      expect(cancelUploadPVC).toHaveBeenCalledWith(DV_NAME, NAMESPACE, CLUSTER);
      expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)?.status).toBe(
        UPLOAD_PROGRESS_STATUS.CANCELED,
      );
    });

    it('should treat 404 from cancelUploadPVC as successful cancellation', async () => {
      const cancelUpload = jest.fn(async () => {
        throw new Error(ERROR_CANCEL_FAILED);
      });
      (cancelUploadPVC as jest.Mock).mockRejectedValueOnce({ code: 404 });

      useUploadProgressStore.getState().startUpload(UPLOAD_KEY, {
        cancelUpload,
        dvCluster: CLUSTER,
        dvName: DV_NAME,
        dvNamespace: NAMESPACE,
        fileName: FILE_IMAGE_ISO,
      });

      await useUploadProgressStore.getState().cancelTrackedUpload(UPLOAD_KEY);

      expect(cancelUploadPVC).toHaveBeenCalledWith(DV_NAME, NAMESPACE, CLUSTER);
      expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)?.status).toBe(
        UPLOAD_PROGRESS_STATUS.CANCELED,
      );
    });

    it('should no-op when upload key does not exist', async () => {
      await useUploadProgressStore.getState().cancelTrackedUpload(MISSING_KEY);

      expect(cancelUploadPVC).not.toHaveBeenCalled();
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

      useUploadProgressStore.getState().startUpload(diskUploadKey, {
        cancelUpload: diskCancelUpload,
        fileName: FILE_IMAGE_ISO,
      });
      useUploadProgressStore.getState().startUpload(cdromUploadKey, {
        cancelUpload: cdromCancelUpload,
        fileName: FILE_IMAGE_ISO,
      });
      useUploadProgressStore.getState().startUpload(bootableVolumeUploadKey, {
        cancelUpload: bootableCancelUpload,
        fileName: FILE_IMAGE_ISO,
      });
      useUploadProgressStore.getState().startUpload(otherVmUploadKey, {
        cancelUpload: otherVmCancelUpload,
        fileName: FILE_IMAGE_ISO,
      });

      await useUploadProgressStore.getState().cancelUploadsForVm(CLUSTER, NAMESPACE, VM_NAME);

      expect(diskCancelUpload).toHaveBeenCalledTimes(1);
      expect(cdromCancelUpload).toHaveBeenCalledTimes(1);
      expect(bootableCancelUpload).not.toHaveBeenCalled();
      expect(otherVmCancelUpload).not.toHaveBeenCalled();
      expect(useUploadProgressStore.getState().getUpload(diskUploadKey)).toBeUndefined();
      expect(useUploadProgressStore.getState().getUpload(cdromUploadKey)).toBeUndefined();
      expect(useUploadProgressStore.getState().getUpload(bootableVolumeUploadKey)?.status).toBe(
        UPLOAD_PROGRESS_STATUS.UPLOADING,
      );
      expect(useUploadProgressStore.getState().getUpload(otherVmUploadKey)?.status).toBe(
        UPLOAD_PROGRESS_STATUS.UPLOADING,
      );
    });

    it('should no-op when no uploads match the VM', async () => {
      await useUploadProgressStore.getState().cancelUploadsForVm(CLUSTER, NAMESPACE, VM_NAME);

      expect(cancelUploadPVC).not.toHaveBeenCalled();
    });

    it('should not cancel completed uploads for the VM', async () => {
      const diskUploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, VM_DISK_NAME);
      const diskCancelUpload = jest.fn(async () => undefined);

      useUploadProgressStore.getState().startUpload(diskUploadKey, {
        cancelUpload: diskCancelUpload,
        fileName: FILE_IMAGE_ISO,
      });
      useUploadProgressStore.getState().completeUpload(diskUploadKey);

      await useUploadProgressStore.getState().cancelUploadsForVm(CLUSTER, NAMESPACE, VM_NAME);

      expect(diskCancelUpload).not.toHaveBeenCalled();
      expect(useUploadProgressStore.getState().getUpload(diskUploadKey)?.status).toBe(
        UPLOAD_PROGRESS_STATUS.SUCCESS,
      );
    });

    it('should cancel empty-cluster uploads when deleting an ACM fleet VM', async () => {
      const emptyClusterUploadKey = getVmDiskUploadKey('', NAMESPACE, VM_NAME, VM_DISK_NAME);
      const cancelUpload = jest.fn(async () => undefined);

      useUploadProgressStore.getState().startUpload(emptyClusterUploadKey, {
        cancelUpload,
        fileName: FILE_IMAGE_ISO,
      });

      await useUploadProgressStore.getState().cancelUploadsForVm(CLUSTER, NAMESPACE, VM_NAME);

      expect(cancelUpload).toHaveBeenCalledTimes(1);
      expect(useUploadProgressStore.getState().getUpload(emptyClusterUploadKey)).toBeUndefined();
    });
  });

  describe('cancelAllPendingUploads', () => {
    it('should cancel and remove all in-progress uploads', async () => {
      const diskUploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, VM_DISK_NAME);
      const bootableVolumeUploadKey = getBootableVolumeUploadKey(
        BOOTABLE_VOLUME_NAMESPACE,
        BOOTABLE_VOLUME_NAME,
      );
      const completedUploadKey = 'completed-upload-key';
      const diskCancelUpload = jest.fn(async () => undefined);
      const bootableCancelUpload = jest.fn(async () => undefined);

      useUploadProgressStore.getState().startUpload(diskUploadKey, {
        cancelUpload: diskCancelUpload,
        fileName: FILE_IMAGE_ISO,
      });
      useUploadProgressStore.getState().startUpload(bootableVolumeUploadKey, {
        cancelUpload: bootableCancelUpload,
        fileName: FILE_IMAGE_ISO,
      });
      useUploadProgressStore.getState().startUpload(completedUploadKey, {
        fileName: FILE_IMAGE_ISO,
      });
      useUploadProgressStore.getState().completeUpload(completedUploadKey);

      await useUploadProgressStore.getState().cancelAllPendingUploads();

      expect(diskCancelUpload).toHaveBeenCalledTimes(1);
      expect(bootableCancelUpload).toHaveBeenCalledTimes(1);
      expect(useUploadProgressStore.getState().getUpload(diskUploadKey)).toBeUndefined();
      expect(useUploadProgressStore.getState().getUpload(bootableVolumeUploadKey)).toBeUndefined();
      expect(useUploadProgressStore.getState().getUpload(completedUploadKey)?.status).toBe(
        UPLOAD_PROGRESS_STATUS.SUCCESS,
      );
    });

    it('should retain uploads when cancelUpload fails without a PVC fallback', async () => {
      const failingUploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, VM_DISK_NAME);
      const succeedingUploadKey = getBootableVolumeUploadKey(
        BOOTABLE_VOLUME_NAMESPACE,
        BOOTABLE_VOLUME_NAME,
      );
      const failingCancelUpload = jest.fn(async () => {
        throw new Error(ERROR_CANCEL_FAILED);
      });
      const succeedingCancelUpload = jest.fn(async () => undefined);

      useUploadProgressStore.getState().startUpload(failingUploadKey, {
        cancelUpload: failingCancelUpload,
        fileName: FILE_IMAGE_ISO,
      });
      useUploadProgressStore.getState().startUpload(succeedingUploadKey, {
        cancelUpload: succeedingCancelUpload,
        fileName: FILE_IMAGE_ISO,
      });

      await useUploadProgressStore.getState().cancelAllPendingUploads();

      expect(failingCancelUpload).toHaveBeenCalledTimes(1);
      expect(succeedingCancelUpload).toHaveBeenCalledTimes(1);
      expect(cancelUploadPVC).not.toHaveBeenCalled();
      expect(useUploadProgressStore.getState().getUpload(failingUploadKey)?.status).toBe(
        UPLOAD_PROGRESS_STATUS.UPLOADING,
      );
      expect(useUploadProgressStore.getState().getUpload(succeedingUploadKey)).toBeUndefined();
    });

    it('should fall back to cancelUploadPVC when cancelUpload fails during cancelAllPendingUploads', async () => {
      const uploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, VM_DISK_NAME);
      const cancelUpload = jest.fn(async () => {
        throw new Error(ERROR_CANCEL_FAILED);
      });

      useUploadProgressStore.getState().startUpload(uploadKey, {
        cancelUpload,
        dvCluster: CLUSTER,
        dvName: DV_NAME,
        dvNamespace: NAMESPACE,
        fileName: FILE_IMAGE_ISO,
      });

      await useUploadProgressStore.getState().cancelAllPendingUploads();

      expect(cancelUpload).toHaveBeenCalledTimes(1);
      expect(cancelUploadPVC).toHaveBeenCalledWith(DV_NAME, NAMESPACE, CLUSTER);
      expect(useUploadProgressStore.getState().getUpload(uploadKey)).toBeUndefined();
    });

    it('should remove upload when cancelUploadPVC throws 404 during cancelAllPendingUploads', async () => {
      const uploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, VM_DISK_NAME);
      const cancelUpload = jest.fn(async () => {
        throw new Error(ERROR_CANCEL_FAILED);
      });
      (cancelUploadPVC as jest.Mock).mockRejectedValueOnce({ code: 404 });

      useUploadProgressStore.getState().startUpload(uploadKey, {
        cancelUpload,
        dvCluster: CLUSTER,
        dvName: DV_NAME,
        dvNamespace: NAMESPACE,
        fileName: FILE_IMAGE_ISO,
      });

      await useUploadProgressStore.getState().cancelAllPendingUploads();

      expect(cancelUploadPVC).toHaveBeenCalledWith(DV_NAME, NAMESPACE, CLUSTER);
      expect(useUploadProgressStore.getState().getUpload(uploadKey)).toBeUndefined();
    });

    it('should retain upload when cancelUploadPVC throws non-404 error during cancelAllPendingUploads', async () => {
      const uploadKey = getVmDiskUploadKey(CLUSTER, NAMESPACE, VM_NAME, VM_DISK_NAME);
      const cancelUpload = jest.fn(async () => {
        throw new Error(ERROR_CANCEL_FAILED);
      });
      (cancelUploadPVC as jest.Mock).mockRejectedValueOnce({ code: 403 });

      useUploadProgressStore.getState().startUpload(uploadKey, {
        cancelUpload,
        dvCluster: CLUSTER,
        dvName: DV_NAME,
        dvNamespace: NAMESPACE,
        fileName: FILE_IMAGE_ISO,
      });

      await useUploadProgressStore.getState().cancelAllPendingUploads();

      expect(cancelUploadPVC).toHaveBeenCalledWith(DV_NAME, NAMESPACE, CLUSTER);
      expect(useUploadProgressStore.getState().getUpload(uploadKey)?.status).toBe(
        UPLOAD_PROGRESS_STATUS.UPLOADING,
      );
    });
  });
});
