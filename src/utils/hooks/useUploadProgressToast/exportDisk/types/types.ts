import { type UploadEntry, type UploadProgressActions } from '../../uploads/types/types';

// todo: use the watch params
export type ExportDiskResourceParamsToWatch = {
  cluster: string;
  namespace: string;
  podName: string;
  pvcName: string;
  secretName: string;
};

export type ExportDiskEntry = {
  progressToastState?: UploadEntry;
  resourceParamsToWatch: ExportDiskResourceParamsToWatch;
};

export type ExportDiskStoreStateActions = UploadProgressActions;

export type ExportDiskStoreStateData = Record<string, ExportDiskEntry>;

export type ExportDiskStoreState = {
  actions: ExportDiskStoreStateActions;
  data: ExportDiskStoreStateData;
  generationsByKey: Record<string, number>;
};
