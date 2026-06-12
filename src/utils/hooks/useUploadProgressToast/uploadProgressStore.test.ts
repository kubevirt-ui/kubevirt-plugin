import { cancelUploadPVC } from '@kubevirt-utils/hooks/useCDIUpload/utils';

import { UPLOAD_PROGRESS_STATUS } from './utils/constants';
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

    it('should no-op when upload key does not exist', async () => {
      await useUploadProgressStore.getState().cancelTrackedUpload(MISSING_KEY);

      expect(cancelUploadPVC).not.toHaveBeenCalled();
    });
  });
});
