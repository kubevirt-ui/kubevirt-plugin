import { TFunction } from 'i18next';

import { UPLOAD_PROGRESS_STATUS } from '../constants';
import { UploadEntry, UploadProgressStatus } from '../types';

export const isTerminalUploadStatus = (status?: UploadProgressStatus): boolean =>
  status === UPLOAD_PROGRESS_STATUS.SUCCESS ||
  status === UPLOAD_PROGRESS_STATUS.ERROR ||
  status === UPLOAD_PROGRESS_STATUS.CANCELED;

export const getUploadTitle = (upload: UploadEntry, t: TFunction): string => {
  const { fileName } = upload;

  if (upload.status === UPLOAD_PROGRESS_STATUS.SUCCESS) {
    return t('Upload of {{fileName}} completed', { fileName });
  }

  if (upload.status === UPLOAD_PROGRESS_STATUS.ERROR) {
    return t('Upload of {{fileName}} failed', { fileName });
  }

  if (upload.status === UPLOAD_PROGRESS_STATUS.CANCELED) {
    return t('Upload of {{fileName}} aborted', { fileName });
  }

  return t('Uploading {{fileName}}', { fileName });
};
