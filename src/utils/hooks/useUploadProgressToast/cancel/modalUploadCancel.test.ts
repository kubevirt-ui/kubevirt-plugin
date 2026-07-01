import { DROPDOWN_FORM_SELECTION } from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import { DataUpload, UPLOAD_STATUS } from '@kubevirt-utils/hooks/useCDIUpload/types';

import { useUploadProgressStore } from '../uploadProgressStore';

import {
  cancelTrackedUploadOnModalClose,
  isCdiUploadInProgress,
  preservesUploadOnModalClose,
} from './modalUploadCancel';

const UPLOAD_KEY = 'test-upload-key';

const createMockDataUpload = (overrides: Partial<DataUpload> = {}): DataUpload => ({
  namespace: 'default',
  pvcName: 'upload-pvc',
  ...overrides,
});

const resetStore = () => {
  useUploadProgressStore.setState({ uploads: {} });
};

describe('modalUploadCancel', () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  describe('isCdiUploadInProgress', () => {
    it('should return true only for UPLOADING status', () => {
      expect(
        isCdiUploadInProgress(createMockDataUpload({ uploadStatus: UPLOAD_STATUS.UPLOADING })),
      ).toBe(true);
    });

    it.each([
      UPLOAD_STATUS.SUCCESS,
      UPLOAD_STATUS.ERROR,
      UPLOAD_STATUS.CANCELED,
      UPLOAD_STATUS.ALLOCATING,
    ])('should return false for %s', (status) => {
      expect(isCdiUploadInProgress(createMockDataUpload({ uploadStatus: status }))).toBe(false);
    });

    it('should return false when upload is undefined', () => {
      expect(isCdiUploadInProgress(undefined)).toBe(false);
    });
  });

  describe('preservesUploadOnModalClose', () => {
    it('should return true for upload volume source', () => {
      expect(preservesUploadOnModalClose(DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME)).toBe(true);
    });

    it('should return false for non-upload sources', () => {
      expect(preservesUploadOnModalClose(DROPDOWN_FORM_SELECTION.USE_HTTP)).toBe(false);
      expect(preservesUploadOnModalClose(DROPDOWN_FORM_SELECTION.USE_EXISTING_PVC)).toBe(false);
    });
  });

  describe('cancelTrackedUploadOnModalClose', () => {
    it('should preserve upload when source is upload type', () => {
      const cancelTrackedUpload = jest.spyOn(
        useUploadProgressStore.getState(),
        'cancelTrackedUpload',
      );

      cancelTrackedUploadOnModalClose({
        sourceType: DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME,
        upload: createMockDataUpload({ uploadStatus: UPLOAD_STATUS.UPLOADING }),
        uploadKey: UPLOAD_KEY,
      });

      expect(cancelTrackedUpload).not.toHaveBeenCalled();
    });

    it('should cancel via store when uploadKey is provided', () => {
      const cancelTrackedUpload = jest
        .spyOn(useUploadProgressStore.getState(), 'cancelTrackedUpload')
        .mockResolvedValue(undefined);

      cancelTrackedUploadOnModalClose({
        sourceType: DROPDOWN_FORM_SELECTION.USE_HTTP,
        upload: createMockDataUpload({ uploadStatus: UPLOAD_STATUS.UPLOADING }),
        uploadKey: UPLOAD_KEY,
      });

      expect(cancelTrackedUpload).toHaveBeenCalledWith(UPLOAD_KEY);
    });

    it('should fall back to upload.cancelUpload when no uploadKey is provided', async () => {
      const cancelUpload = jest.fn().mockResolvedValue(undefined);

      cancelTrackedUploadOnModalClose({
        sourceType: DROPDOWN_FORM_SELECTION.USE_HTTP,
        upload: createMockDataUpload({
          cancelUpload,
          uploadStatus: UPLOAD_STATUS.UPLOADING,
        }),
      });

      await Promise.resolve();

      expect(cancelUpload).toHaveBeenCalledTimes(1);
    });

    it('should no-op when upload is not in progress', () => {
      const cancelTrackedUpload = jest.spyOn(
        useUploadProgressStore.getState(),
        'cancelTrackedUpload',
      );
      const cancelUpload = jest.fn();

      cancelTrackedUploadOnModalClose({
        sourceType: DROPDOWN_FORM_SELECTION.USE_HTTP,
        upload: createMockDataUpload({
          cancelUpload,
          uploadStatus: UPLOAD_STATUS.SUCCESS,
        }),
        uploadKey: UPLOAD_KEY,
      });

      expect(cancelTrackedUpload).not.toHaveBeenCalled();
      expect(cancelUpload).not.toHaveBeenCalled();
    });
  });
});
