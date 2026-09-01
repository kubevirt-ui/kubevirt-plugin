import { type Dispatch, type SetStateAction } from 'react';
import axios, { type CancelTokenSource } from 'axios';
import { type TFunction } from 'i18next';

import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';

import { CANCEL_ALLOCATION_MESSAGE, UploadCanceledError } from './errors';
import { type DataUpload, UPLOAD_STATUS, type UploadError } from './types';
import { createUploadPVC, getUploadURL } from './utils';

type SyncStoreFn = (
  status: UPLOAD_STATUS,
  progress?: number,
  uploadError?: DataUpload['uploadError'],
) => void;

type PerformUploadParams = {
  cancelSource: CancelTokenSource;
  dataVolume: V1beta1DataVolume;
  file: File;
  setUpload: Dispatch<SetStateAction<DataUpload | undefined>>;
  syncStore: SyncStoreFn;
  t: TFunction;
  uploadProxyURL: string;
};

export const performUpload = async ({
  cancelSource,
  dataVolume,
  file,
  setUpload,
  syncStore,
  t,
  uploadProxyURL,
}: PerformUploadParams): Promise<void> => {
  try {
    try {
      await axios.get(getUploadURL(uploadProxyURL));
    } catch (catchError) {
      if (!catchError?.response) {
        const certificateError = {
          href: getUploadURL(uploadProxyURL),
          message: t('Invalid certificate, please visit the following URL and approve it'),
        };
        setUpload((prev) => ({
          ...prev,
          uploadError: certificateError,
          uploadStatus: UPLOAD_STATUS.ERROR,
        }));
        syncStore(UPLOAD_STATUS.ERROR, undefined, certificateError);
        return Promise.reject(certificateError);
      }
    }

    const { token } = await createUploadPVC(dataVolume);

    const form = new FormData();
    form.append('file', file);

    await axios({
      cancelToken: cancelSource.token,
      data: form,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      method: 'POST',
      onUploadProgress: (e) => {
        const progress = file.size > 0 ? Math.floor((e.loaded / file.size) * 100) : 0;
        setUpload((prev) => ({
          ...prev,
          progress,
          uploadStatus: UPLOAD_STATUS.UPLOADING,
        }));
        syncStore(UPLOAD_STATUS.UPLOADING, progress);
      },
      url: getUploadURL(uploadProxyURL),
    });

    setUpload((prev) => ({
      ...prev,
      progress: 100,
      uploadStatus: UPLOAD_STATUS.SUCCESS,
    }));
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    const isCanceled = axios.isCancel(e) || errorMessage.includes(CANCEL_ALLOCATION_MESSAGE);

    const uploadError: undefined | UploadError = isCanceled
      ? undefined
      : { message: errorMessage || t('Upload failed') };
    setUpload((prev) => ({
      ...prev,
      uploadError,
      uploadStatus: isCanceled ? UPLOAD_STATUS.CANCELED : UPLOAD_STATUS.ERROR,
    }));
    syncStore(isCanceled ? UPLOAD_STATUS.CANCELED : UPLOAD_STATUS.ERROR, undefined, uploadError);
    if (isCanceled) {
      return Promise.reject(new UploadCanceledError());
    }

    return Promise.reject(e);
  }
};
