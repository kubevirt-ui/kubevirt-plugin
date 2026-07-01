import { create } from 'zustand';

import { type IoK8sApiCoreV1Pod } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  getClusterNamespaceNameKey,
  getName,
  getNamespace,
} from '@kubevirt-utils/resources/shared';

export type ExportUploadState = {
  cluster: string;
  namespace: string;
  podName: string;
  pvcName: string;
  secretName: string;
};

type ExportUploadStore = {
  clearUpload: (cluster: string, namespace: string, pvcName: string) => void;
  getUpload: (cluster: string, namespace: string, pvcName: string) => ExportUploadState | undefined;
  setUpload: (state: ExportUploadState) => void;
  uploads: Record<string, ExportUploadState>;
};

const uploadKey = (cluster: string, namespace: string, pvcName: string): string =>
  getClusterNamespaceNameKey(cluster, namespace, pvcName);

export const useExportUploadStore = create<ExportUploadStore>((set, get) => ({
  clearUpload: (cluster, namespace, pvcName): void =>
    set((state) => {
      const nextUploads = { ...state.uploads };
      delete nextUploads[uploadKey(cluster, namespace, pvcName)];
      return { uploads: nextUploads };
    }),
  getUpload: (cluster, namespace, pvcName): ExportUploadState | undefined =>
    get().uploads[uploadKey(cluster, namespace, pvcName)],
  setUpload: (uploadState): void =>
    set((state) => ({
      uploads: {
        ...state.uploads,
        [uploadKey(uploadState.cluster, uploadState.namespace, uploadState.pvcName)]: uploadState,
      },
    })),
  uploads: {},
}));

export const persistExportPod = (
  pod: IoK8sApiCoreV1Pod,
  cluster: string,
  pvcName: string,
  secretName: string,
): void => {
  const namespace = getNamespace(pod);
  const podName = getName(pod);
  if (!namespace || !podName) {
    return;
  }

  useExportUploadStore.getState().setUpload({
    cluster,
    namespace,
    podName,
    pvcName,
    secretName,
  });
};
