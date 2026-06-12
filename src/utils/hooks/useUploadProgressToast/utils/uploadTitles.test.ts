import { TFunction } from 'i18next';

import { UPLOAD_PROGRESS_STATUS } from './constants';
import { UploadEntry } from './types';
import { getUploadTitle, isTerminalUploadStatus } from './uploadTitles';

const t = ((key: string, options?: { fileName?: string }) =>
  options?.fileName ? `${key}:${options.fileName}` : key) as TFunction;

const createUpload = (status: UploadEntry['status'], fileName = 'image.iso'): UploadEntry => ({
  fileName,
  progress: status === UPLOAD_PROGRESS_STATUS.SUCCESS ? 100 : 50,
  status,
});

describe('uploadTitles', () => {
  describe('isTerminalUploadStatus', () => {
    it.each([
      UPLOAD_PROGRESS_STATUS.SUCCESS,
      UPLOAD_PROGRESS_STATUS.ERROR,
      UPLOAD_PROGRESS_STATUS.CANCELED,
    ])('should return true for %s', (status) => {
      expect(isTerminalUploadStatus(status)).toBe(true);
    });

    it('should return false for UPLOADING', () => {
      expect(isTerminalUploadStatus(UPLOAD_PROGRESS_STATUS.UPLOADING)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isTerminalUploadStatus(undefined)).toBe(false);
    });
  });

  describe('getUploadTitle', () => {
    it('should return uploading title using fileName', () => {
      expect(getUploadTitle(createUpload(UPLOAD_PROGRESS_STATUS.UPLOADING), t)).toBe(
        'Uploading {{fileName}}:image.iso',
      );
    });

    it('should return completed title using fileName', () => {
      expect(getUploadTitle(createUpload(UPLOAD_PROGRESS_STATUS.SUCCESS), t)).toBe(
        'Upload of {{fileName}} completed:image.iso',
      );
    });

    it('should return failed title using fileName', () => {
      expect(getUploadTitle(createUpload(UPLOAD_PROGRESS_STATUS.ERROR), t)).toBe(
        'Upload of {{fileName}} failed:image.iso',
      );
    });

    it('should return aborted title using fileName', () => {
      expect(getUploadTitle(createUpload(UPLOAD_PROGRESS_STATUS.CANCELED), t)).toBe(
        'Upload of {{fileName}} aborted:image.iso',
      );
    });
  });
});
