import { UPLOAD_STATUS } from '@kubevirt-utils/hooks/useCDIUpload/types';

import { UPLOAD_PROGRESS_STATUS } from '../constants';
import { useUploadProgressStore } from '../uploadProgressStore';

import { registerCdiUpload, syncCdiUploadProgressAndFailures } from './cdiUploadTracking';

const UPLOAD_KEY = 'test-upload-key';
const FILE_IMAGE_ISO = 'image.iso';
const FILE_OLD_ISO = 'old.iso';
const FILE_NEW_ISO = 'new.iso';
const DISK_NAME = 'disk-1';
const MISSING_KEY = 'missing-key';
const CDI_UPLOAD_ERROR_MESSAGE = 'CDI upload failed';

const resetStore = () => {
  useUploadProgressStore.setState({ uploads: {} });
};

describe('cdiUploadTracking', () => {
  beforeEach(() => {
    resetStore();
    jest.restoreAllMocks();
  });

  describe('registerCdiUpload', () => {
    it('should start a new upload in the store', () => {
      registerCdiUpload({
        fileName: FILE_IMAGE_ISO,
        metadata: { resourceName: DISK_NAME },
        uploadKey: UPLOAD_KEY,
      });

      expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)).toMatchObject({
        fileName: FILE_IMAGE_ISO,
        progress: 0,
        resourceName: DISK_NAME,
        status: UPLOAD_PROGRESS_STATUS.UPLOADING,
      });
    });

    it('should remove existing non-terminal entry before starting a new one', () => {
      useUploadProgressStore.getState().startUpload(UPLOAD_KEY, { fileName: FILE_OLD_ISO });

      const removeUpload = jest.spyOn(useUploadProgressStore.getState(), 'removeUpload');

      registerCdiUpload({
        fileName: FILE_NEW_ISO,
        uploadKey: UPLOAD_KEY,
      });

      expect(removeUpload).toHaveBeenCalledWith(UPLOAD_KEY);
      expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)).toMatchObject({
        fileName: FILE_NEW_ISO,
        progress: 0,
        status: UPLOAD_PROGRESS_STATUS.UPLOADING,
      });

      removeUpload.mockRestore();
    });

    it('should not remove an existing terminal entry before starting a new one', () => {
      useUploadProgressStore.getState().startUpload(UPLOAD_KEY, { fileName: FILE_OLD_ISO });
      useUploadProgressStore.getState().completeUpload(UPLOAD_KEY);

      expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)?.status).toBe(
        UPLOAD_PROGRESS_STATUS.SUCCESS,
      );

      const removeUpload = jest.spyOn(useUploadProgressStore.getState(), 'removeUpload');

      registerCdiUpload({
        fileName: FILE_NEW_ISO,
        uploadKey: UPLOAD_KEY,
      });

      expect(removeUpload).not.toHaveBeenCalled();
      expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)).toMatchObject({
        fileName: FILE_NEW_ISO,
        progress: 0,
        status: UPLOAD_PROGRESS_STATUS.UPLOADING,
      });

      removeUpload.mockRestore();
    });
  });

  describe('syncCdiUploadProgressAndFailures', () => {
    beforeEach(() => {
      useUploadProgressStore.getState().startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
    });

    it('should update progress when given progress value', () => {
      syncCdiUploadProgressAndFailures({
        progress: 75,
        uploadKey: UPLOAD_KEY,
      });

      expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)?.progress).toBe(75);
    });

    it('should call failUpload when status is ERROR', () => {
      syncCdiUploadProgressAndFailures({
        uploadError: { message: CDI_UPLOAD_ERROR_MESSAGE },
        uploadKey: UPLOAD_KEY,
        uploadStatus: UPLOAD_STATUS.ERROR,
      });

      expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)).toMatchObject({
        errorMessage: CDI_UPLOAD_ERROR_MESSAGE,
        status: UPLOAD_PROGRESS_STATUS.ERROR,
      });
    });

    it('should call markUploadCanceled when status is CANCELED', () => {
      syncCdiUploadProgressAndFailures({
        uploadKey: UPLOAD_KEY,
        uploadStatus: UPLOAD_STATUS.CANCELED,
      });

      expect(useUploadProgressStore.getState().getUpload(UPLOAD_KEY)?.status).toBe(
        UPLOAD_PROGRESS_STATUS.CANCELED,
      );
    });

    it('should no-op when upload key does not exist', () => {
      syncCdiUploadProgressAndFailures({
        progress: 50,
        uploadKey: MISSING_KEY,
      });

      expect(useUploadProgressStore.getState().uploads).toEqual({
        [UPLOAD_KEY]: expect.objectContaining({ fileName: FILE_IMAGE_ISO }),
      });
    });
  });
});
