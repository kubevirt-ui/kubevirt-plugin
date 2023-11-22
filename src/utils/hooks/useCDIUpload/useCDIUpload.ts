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
  name: 'config',
  namespaced: false,
};

export const useCDIUpload = (): UseCDIUploadValues => {
  const { t } = useKubevirtTranslation();
  const [cdiConfig, configLoaded, configError] = useK8sWatchResource<CDIConfig>(resource);
  const [upload, setUpload] = React.useState<DataUpload>();
  const uploadProxyURL = getUploadProxyURL(cdiConfig);

  const uploadData = async ({ dataVolume, file }: UploadDataProps) => {
    const { CancelToken } = axios;
    const cancelSource = CancelToken.source();
    const noRouteFound = configError || !configLoaded || !uploadProxyURL;

    const newUpload: DataUpload = {
      cancelUpload: () => {
        cancelSource.cancel();
        setUpload({ ...newUpload, uploadStatus: UPLOAD_STATUS.CANCELED });
        return killUploadPVC(dataVolume.metadata.name, dataVolume.metadata.namespace);
      },
      fileName: file?.name,
      namespace: dataVolume.metadata.namespace,
      progress: 0,
      pvcName: dataVolume.metadata.name,
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
          href: getUploadURL(uploadProxyURL),
          message: t('Invalid certificate, please visit the following URL and approve it'),
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
        cancelToken: cancelSource.token,
        data: form,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        method: 'POST',
        onUploadProgress: (e) => {
          setUpload({
            ...newUpload,
            progress: Math.floor((e.loaded / file.size) * 100),
            uploadStatus: UPLOAD_STATUS.UPLOADING,
          });
        },
        url: getUploadURL(uploadProxyURL),
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
        uploadError: !isCanceled && { message: `${e?.message}: ${e?.response?.data}` },
        uploadStatus: isCanceled ? UPLOAD_STATUS.CANCELED : UPLOAD_STATUS.ERROR,
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
  cancelUpload?: () => Promise<{
    metadata: {
      name: string;
      namespace: string;
    };
  }>;
  fileName?: string;
  namespace: string;
  progress?: number;
  pvcName: string;
  uploadError?: any;
  uploadStatus?: UPLOAD_STATUS;
};

export type UseCDIUploadValues = {
  upload: DataUpload;
  uploadData: ({ dataVolume, file }: UploadDataProps) => Promise<void>;
};

export type UploadDataProps = {
  dataVolume: V1beta1DataVolume;
  file: File;
};
