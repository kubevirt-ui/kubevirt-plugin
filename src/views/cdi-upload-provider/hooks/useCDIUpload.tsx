import React, { useRef, useState } from 'react';
import axios from 'axios';

import { CDIConfigModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { CDIConfig, getUploadProxyURL } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useK8sWatchResource, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';

import { CDI_UPLOAD_URL_BUILDER, UPLOAD_STATUS } from '../utils/consts';
import { CDIUploadContextProps } from '../utils/context';
import { DataUpload, UploadDataProps } from '../utils/types';

const resource: WatchK8sResource = {
  isList: false,
  kind: CDIConfigModelRef,
  name: 'config',
  namespaced: false,
};

const useCDIUpload = (): CDIUploadContextProps => {
  const [cdiConfig, configLoaded, configError] = useK8sWatchResource<CDIConfig>(resource);
  const [uploads, setUploads] = useState<DataUpload[]>([]);
  const canUpdateState = useRef<boolean>(true);
  const uploadProxyURL = getUploadProxyURL(cdiConfig);

  const updateUpload = (changedUpload: DataUpload) => {
    if (canUpdateState.current) {
      canUpdateState.current = false;

      setUploads((prevUploads) => {
        const rest = prevUploads?.filter(
          (upl) =>
            upl?.pvcName !== changedUpload?.pvcName || upl?.namespace !== changedUpload?.namespace,
        );

        return [...rest, changedUpload];
      });
    }
  };

  const uploadData = ({ file, namespace, pvcName, token }: UploadDataProps) => {
    const { CancelToken } = axios;
    const cancelSource = CancelToken.source();
    const noRouteFound = configError || !configLoaded || !uploadProxyURL;

    const newUpload: DataUpload = {
      cancelUpload: cancelSource.cancel,
      fileName: file?.name,
      namespace,
      progress: 0,
      pvcName,
      uploadError: noRouteFound && { message: `No Upload URL found ${configError}` },
      uploadStatus: noRouteFound ? UPLOAD_STATUS.ERROR : UPLOAD_STATUS.UPLOADING,
    };

    if (noRouteFound) {
      updateUpload(newUpload);
      return;
    }

    const form = new FormData();
    form.append('file', file);
    try {
      axios({
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
          uploadError: { message: `${err.message}: ${err.response?.data}` },
        }),
      });
    }
  };

  // multiple uploads could cause abuse of setUploads, so we use a Ref until state finished updating.
  React.useEffect(() => {
    if (!canUpdateState.current) {
      canUpdateState.current = true;
    }
  }, [uploads]);

  return {
    uploadData,
    uploadProxyURL,
    uploads,
  };
};

export default useCDIUpload;
