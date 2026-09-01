import { useCallback, useState } from 'react';
import axios from 'axios';

import { CDIConfigModel, modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { useKubevirtTranslation } from '../useKubevirtTranslation';

import {
  registerCdiUpload,
  syncCdiUploadProgressAndFailures,
} from '../useUploadProgressToast/cdi/cdiUploadTracking';
import { performUpload } from './performUpload';
import {
  type CDIConfig,
  type DataUpload,
  UPLOAD_STATUS,
  type UploadDataProps,
  type UseCDIUploadValues,
} from './types';
import { cancelUploadPVC, getUploadProxyURL, getUploadURL } from './utils';

export const useCDIUpload = (clusterInput?: string): UseCDIUploadValues => {
  const clusterParam = useClusterParam();
  const cluster = clusterParam ?? clusterInput;
  const { t } = useKubevirtTranslation();
  const [cdiConfig, configLoaded, configError] = useK8sWatchData<CDIConfig>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(CDIConfigModel),
    isList: false,
    name: 'config',
    namespaced: false,
  });

  const [upload, setUpload] = useState<DataUpload>();
  const uploadProxyURL = getUploadProxyURL(cdiConfig);

  const checkUploadReady = useCallback(async (): Promise<void> => {
    const noRouteFound = configError || !configLoaded || !uploadProxyURL;

    if (noRouteFound) {
      return Promise.reject({
        message: t('No upload URL found {{configError}}', { configError }),
      });
    }

    try {
      await axios.get(getUploadURL(uploadProxyURL));
    } catch (catchError) {
      if (!catchError?.response) {
        return Promise.reject({
          href: getUploadURL(uploadProxyURL),
          message: t('Invalid certificate, please visit the following URL and approve it'),
        });
      }
    }
  }, [configError, configLoaded, uploadProxyURL, t]);

  const uploadData = async ({
    dataVolume,
    file,
    uploadKey,
    uploadTrackMetadata,
  }: UploadDataProps): Promise<void> => {
    const { CancelToken } = axios;
    const cancelSource = CancelToken.source();
    const noRouteFound = configError || !configLoaded || !uploadProxyURL;
    const namespace = getNamespace(dataVolume);
    const name = getName(dataVolume);

    const syncStore = (
      status: UPLOAD_STATUS,
      progress?: number,
      uploadError?: DataUpload['uploadError'],
    ): void => {
      if (!uploadKey) {
        return;
      }
      syncCdiUploadProgressAndFailures({ progress, uploadError, uploadKey, uploadStatus: status });
    };

    const newUpload: DataUpload = {
      cancelUpload: () => {
        cancelSource.cancel();
        setUpload((prev) => ({ ...prev, uploadStatus: UPLOAD_STATUS.CANCELED }));
        syncStore(UPLOAD_STATUS.CANCELED);
        return cancelUploadPVC(name, namespace, cluster);
      },
      fileName: file?.name,
      namespace,
      progress: 0,
      pvcName: name,
      uploadError: noRouteFound
        ? { message: t('No upload URL found {{configError}}', { configError }) }
        : undefined,
      uploadStatus: noRouteFound ? UPLOAD_STATUS.ERROR : UPLOAD_STATUS.ALLOCATING,
    };

    if (!file || !dataVolume) {
      return Promise.reject({ message: t('Missing required fields') });
    }

    if (noRouteFound) {
      setUpload(newUpload);
      return Promise.reject(new Error(t('No upload URL found {{configError}}', { configError })));
    }

    setUpload({ ...newUpload, uploadStatus: UPLOAD_STATUS.ALLOCATING });
    if (uploadKey) {
      registerCdiUpload({
        cancelUpload: newUpload.cancelUpload,
        fileName: file.name,
        metadata: uploadTrackMetadata,
        uploadKey,
      });
    }

    return performUpload({
      cancelSource,
      dataVolume,
      file,
      setUpload,
      syncStore,
      t,
      uploadProxyURL,
    });
  };

  return {
    checkUploadReady,
    upload,
    uploadData,
  };
};
