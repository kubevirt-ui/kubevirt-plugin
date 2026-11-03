import { type IoK8sApiCoreV1Pod } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  type InFlightToastStoreActions,
  type ProgressToastStateParams,
  type StartUploadEntry,
} from '@kubevirt-utils/hooks/useInFlightToast/shared/types/types';

export type ExportDiskContext = {
  cluster: string;
  namespace: string;
  podName: string;
  pvcName: string;
  secretName: string;
};

export type ExportDiskEntry = ProgressToastStateParams & {
  context: ExportDiskContext | null;
};

export type StartExportDiskUploadParams = {
  cluster: string;
  entry: StartUploadEntry;
  pod: IoK8sApiCoreV1Pod;
  pvcName: string;
  secretName: string;
};

export type ExportDiskStoreStateActions = Omit<InFlightToastStoreActions, 'startUpload'> & {
  clearExportDiskWatchContext: (uploadKey: string) => void;
  startUpload: (uploadKey: string, params: StartExportDiskUploadParams) => number | undefined;
};

export type ExportDiskStoreStateData = Record<string, ExportDiskEntry>;

export type ExportDiskStoreState = {
  actions: ExportDiskStoreStateActions;
  data: ExportDiskStoreStateData;
  generationsByKey: Record<string, number>;
};
