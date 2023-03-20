import * as React from 'react';
import axios from 'axios';

import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import CDIConfigModel from '@kubevirt-ui/kubevirt-api/console/models/CDIConfigModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useK8sWatchResource, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';

import { useKubevirtTranslation } from '../useKubevirtTranslation';

import {
  CDIConfig,
  createUploadPVC,
  getUploadProxyURL,
  getUploadURL,
  killUploadPVC,
  UPLOAD_STATUS,
} from './utils';

const resource: WatchK8sResource = {
  groupVersionKind: modelToGroupVersionKind(CDIConfigModel),
  isList: false,
  namespaced: false,
  name: 'config',
};

export const useCDIUpload = (): UseCDIUploadValues => {
  const { t } = useKubevirtTranslation();
  const [cdiConfig, configLoaded, configError] = useK8sWatchResource<CDIConfig>(resource);
  const [upload, setUpload] = React.useState<DataUpload>();
  const uploadProxyURL = getUploadProxyURL(cdiConfig);

  const uploadData = async ({ file, dataVolume }: UploadDataProps) => {
    const { CancelToken } = axios;
    const cancelSource = CancelToken.source();
    const noRouteFound = configError || !configLoaded || !uploadProxyURL;

    const newUpload: DataUpload = {
      pvcName: dataVolume.metadata.name,
      namespace: dataVolume.metadata.namespace,
      progress: 0,
      fileName: file?.name,
      cancelUpload: () => {
        cancelSource.cancel();
        setUpload({ ...newUpload, uploadStatus: UPLOAD_STATUS.CANCELED });
        return killUploadPVC(dataVolume.metadata.name, dataVolume.metadata.namespace);
      },
      uploadError: noRouteFound && {
        message: t('No Upload URL found {{configError}}', { configError }),
      },
      uploadStatus: noRouteFound ? UPLOAD_STATUS.ERROR : UPLOAD_STATUS.ALLOCATING,
    };
    // check for nullish values
    if (!file || !dataVolume) {
      return Promise.reject({
        message: t('Missing required fields'),
      });
    }

    // check if CORS is permitting
    try {
      await axios.get(getUploadURL(uploadProxyURL));
    } catch (catchError) {
      if (catchError?.response?.data === undefined) {
        return Promise.reject({
          message: t('Invalid certificate, please visit the following URL and approve it'),
          href: getUploadURL(uploadProxyURL),
        });
      }
    }

    try {
      if (noRouteFound) {
        setUpload(newUpload);
        throw new Error(t('No Upload URL found {{configError}}', { configError }));
      }

      // allocating
      setUpload({
        ...newUpload,
        uploadStatus: UPLOAD_STATUS.ALLOCATING,
      });
      const { token } = await createUploadPVC(dataVolume);

      // uploading
      const form = new FormData();
      form.append('file', file);

      await axios({
        method: 'POST',
        url: getUploadURL(uploadProxyURL),
        data: form,
        cancelToken: cancelSource.token,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (e) => {
          setUpload({
            ...newUpload,
            uploadStatus: UPLOAD_STATUS.UPLOADING,
            progress: Math.floor((e.loaded / file.size) * 100),
          });
        },
      });

      // finished uploading
      setUpload({
        ...newUpload,
        progress: 100,
        uploadStatus: UPLOAD_STATUS.SUCCESS,
      });
    } catch (e) {
      // if cancelled, 'not found' is a case where the user clicked cancel while allocating
      const isCanceled = axios.isCancel(e) || e?.message.includes('not found');

      setUpload({
        ...newUpload,
        uploadStatus: isCanceled ? UPLOAD_STATUS.CANCELED : UPLOAD_STATUS.ERROR,
        uploadError: !isCanceled && { message: `${e?.message}: ${e?.response?.data}` },
      });
      return Promise.reject(isCanceled ? { message: t('Upload cancelled') } : e);
    }
  };

  return {
    upload,
    uploadData,
  };
};

export type DataUpload = {
  pvcName: string;
  namespace: string;
  fileName?: string;
  progress?: number;
  uploadStatus?: UPLOAD_STATUS;
  uploadError?: any;
  cancelUpload?: () => Promise<{
    metadata: {
      name: string;
      namespace: string;
    };
  }>;
};

export type UseCDIUploadValues = {
  upload: DataUpload;
  uploadData: ({ file, dataVolume }: UploadDataProps) => Promise<void>;
};

export type UploadDataProps = {
  file: File;
  dataVolume: V1beta1DataVolume;
};
