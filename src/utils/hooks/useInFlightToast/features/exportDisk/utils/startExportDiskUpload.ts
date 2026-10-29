import { type IoK8sApiCoreV1Pod } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { UPLOAD_PROGRESS_STATUS } from '@kubevirt-utils/hooks/useInFlightToast/constants';
import { type UploadsActionsParamsWithStoreSlice } from '@kubevirt-utils/hooks/useInFlightToast/shared/types/types';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

import { type ExportDiskContext, type StartExportDiskUploadParams } from '../types/types';

type GetExportDiskContextParams = {
  cluster: string;
  pod: IoK8sApiCoreV1Pod;
  pvcName: string;
  secretName: string;
};

const getExportDiskContext = ({
  cluster,
  pod,
  pvcName,
  secretName,
}: GetExportDiskContextParams): ExportDiskContext | undefined => {
  const namespace = getNamespace(pod);
  const podName = getName(pod);
  if (!namespace || !podName) {
    return;
  }

  return {
    cluster,
    namespace,
    podName,
    pvcName,
    secretName,
  };
};

export const createStartExportDiskUpload = (
  { get, set, storeSlice }: UploadsActionsParamsWithStoreSlice,
  uploadKey: string,
  { cluster, entry, pod, pvcName, secretName }: StartExportDiskUploadParams,
): number | undefined => {
  const generation = (get()[storeSlice].generationsByKey?.[uploadKey] ?? 0) + 1;
  const context = getExportDiskContext({ cluster, pod, pvcName, secretName });
  if (!context) {
    return;
  }

  set((state) => ({
    [storeSlice]: {
      ...state[storeSlice],
      data: {
        ...state[storeSlice].data,
        [uploadKey]: {
          ...state[storeSlice].data[uploadKey],
          context,
          progressToastState: {
            blockNavigation: true,
            ...entry,
            generation,
            progress: 0,
            status: UPLOAD_PROGRESS_STATUS.UPLOADING,
          },
        },
      },
      generationsByKey: { ...state[storeSlice].generationsByKey, [uploadKey]: generation },
    },
  }));
  return generation;
};
