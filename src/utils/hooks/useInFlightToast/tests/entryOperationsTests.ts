import {
  FILE_IMAGE_ISO,
  type SliceTestHelper,
  TOAST_ID_1,
  TOAST_ID_2,
  UPLOAD_KEY,
} from './inFlightToastStore.test';

export const describeEntryOperations = (slice: SliceTestHelper): void => {
  describe('removeUpload', () => {
    it('should delete the upload entry', () => {
      slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      slice.getActions()?.removeUpload(UPLOAD_KEY);

      expect(slice.getActions()?.getUpload(UPLOAD_KEY)).toBeUndefined();
    });
  });

  describe('trySetToastId', () => {
    it('should set toastId on first call and return true', () => {
      slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      const result = slice.getActions()?.trySetToastId(UPLOAD_KEY, TOAST_ID_1);

      expect(result).toBe(true);
      expect(slice.getActions()?.getUpload(UPLOAD_KEY)?.toastId).toBe(TOAST_ID_1);
    });

    it('should return false when toastId is already set', () => {
      slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
      slice.getActions()?.trySetToastId(UPLOAD_KEY, TOAST_ID_1);

      const result = slice.getActions()?.trySetToastId(UPLOAD_KEY, TOAST_ID_2);

      expect(result).toBe(false);
      expect(slice.getActions()?.getUpload(UPLOAD_KEY)?.toastId).toBe(TOAST_ID_1);
    });
  });

  describe('tryMarkTerminalToastShown', () => {
    it('should mark terminal toast shown on first call and return true', () => {
      slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

      const result = slice.getActions()?.tryMarkTerminalToastShown(UPLOAD_KEY);

      expect(result).toBe(true);
      expect(slice.getActions()?.getUpload(UPLOAD_KEY)?.terminalToastShown).toBe(true);
    });

    it('should return false on second call', () => {
      slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
      slice.getActions()?.tryMarkTerminalToastShown(UPLOAD_KEY);

      const result = slice.getActions()?.tryMarkTerminalToastShown(UPLOAD_KEY);

      expect(result).toBe(false);
    });
  });
};
