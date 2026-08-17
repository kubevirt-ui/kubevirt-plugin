import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

import { CDIConfigModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type CDIConfig } from '@kubevirt-utils/hooks/useCDIUpload/types';
import { getUploadProxyURL } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useK8sWatchResource, type WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';

import { CDI_UPLOAD_URL_BUILDER, UPLOAD_STATUS } from '../utils/consts';
import { type CDIUploadContextProps } from '../utils/context';
import { type DataUpload, type UploadDataProps } from '../utils/types';

const resource: WatchK8sResource = {
  isList: false,
  kind: CDIConfigModelRef,
  name: 'config',
  namespaced: false,
};

const useCDIUpload = (): CDIUploadContextProps => {
  const { t } = useKubevirtTranslation();
  const [cdiConfig, configLoaded, configError] = useK8sWatchResource<CDIConfig>(resource) as [
    CDIConfig,
    boolean,
    Error,
  ];
  const [uploads, setUploads] = useState<DataUpload[]>([]);
  const canUpdateStateRef = useRef<boolean>(true);
  const uploadProxyURL = getUploadProxyURL(cdiConfig);

  const updateUpload = (changedUpload: DataUpload): void => {
    if (canUpdateStateRef.current) {
      canUpdateStateRef.current = false;

      setUploads((prevUploads) => {
        const rest = prevUploads?.filter(
          (upl) =>
            upl?.pvcName !== changedUpload?.pvcName || upl?.namespace !== changedUpload?.namespace,
        );

        return [...rest, changedUpload];
      });
    }
  };

  const uploadData = ({ file, namespace, pvcName, token }: UploadDataProps): void => {
    const { CancelToken } = axios;
    const cancelSource = CancelToken.source();
    const noRouteFound = configError || !configLoaded || !uploadProxyURL;

    const newUpload: DataUpload = {
      cancelUpload: cancelSource.cancel,
      fileName: file?.name,
      namespace,
      progress: 0,
      pvcName,
      uploadError: noRouteFound && {
        message: t('No upload URL found {{configError}}', { configError }),
      },
      uploadStatus: noRouteFound ? UPLOAD_STATUS.ERROR : UPLOAD_STATUS.UPLOADING,
    };

    if (noRouteFound) {
      updateUpload(newUpload);
      return;
    }

    const form = new FormData();
    form.append('file', file);
    try {
      void axios({
        cancelToken: cancelSource.token,
        data: form,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        method: 'POST',
        onUploadProgress: (e) => {
          const progress = Math.floor((e.loaded / file.size) * 100);
          updateUpload({
            ...newUpload,
            progress,
            ...(progress === 100 && { uploadStatus: UPLOAD_STATUS.SUCCESS }),
          });
        },
        url: CDI_UPLOAD_URL_BUILDER(uploadProxyURL),
      });
    } catch (err) {
      const isCancel = axios.isCancel(err);
      updateUpload({
        ...newUpload,
        uploadStatus: isCancel ? UPLOAD_STATUS.CANCELED : UPLOAD_STATUS.ERROR,
        ...(isCancel && {
          uploadError: { message: `${err.message}` },
        }),
      });
    }
  };

  // multiple uploads could cause abuse of setUploads, so we use a Ref until state finished updating.
  useEffect(() => {
    if (!canUpdateStateRef.current) {
      canUpdateStateRef.current = true;
    }
  }, [uploads]);

  return {
    uploadData,
    uploadProxyURL,
    uploads,
  };
};

export default useCDIUpload;
