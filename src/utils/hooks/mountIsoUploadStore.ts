import { create } from 'zustand';

import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';

export const UPLOAD_ALERT_STATUS = {
  ERROR: 'error',
  SUCCESS: 'success',
  UPLOADING: 'uploading',
} as const;

export type UploadAlertStatus = (typeof UPLOAD_ALERT_STATUS)[keyof typeof UPLOAD_ALERT_STATUS];

export type MountIsoUploadState = {
  alertDismissed?: boolean;
  cdromDiskName?: string;
  errorHref?: string;
  errorMessage?: string;
  status: UploadAlertStatus;
};

type CancelUploadHandler = () => Promise<unknown> | void;

type MountIsoUploadStore = {
  cancelUploads: Record<string, CancelUploadHandler>;
  clearCancelUpload: (uploadKey: string) => void;
  clearUpload: (uploadKey: string) => void;
  getCancelUpload: (uploadKey: string) => CancelUploadHandler | undefined;
  getUpload: (uploadKey: string) => MountIsoUploadState | undefined;
  setCancelUpload: (uploadKey: string, cancelUpload: CancelUploadHandler) => void;
  setUpload: (uploadKey: string, state: MountIsoUploadState) => void;
  uploads: Record<string, MountIsoUploadState>;
};

/**
 * VM scope prefix: cluster/namespace/vmName
 * @param cluster
 * @param namespace
 * @param vmName
 */
export const getVmUploadKey = (cluster: string, namespace: string, vmName: string): string =>
  `${cluster || ''}/${namespace}/${vmName}`;

export const getVmUploadKeyFromVm = (vm: {
  cluster?: string;
  metadata?: { name?: string; namespace?: string };
}): string => getVmUploadKey(getCluster(vm), getNamespace(vm), getName(vm));

export const getCdromUploadKey = (
  cluster: string,
  namespace: string,
  vmName: string,
  cdromDiskName: string,
): string => `${getVmUploadKey(cluster, namespace, vmName)}/${cdromDiskName}`;

export const getCdromUploadKeyFromVm = (
  vm: { cluster?: string; metadata?: { name?: string; namespace?: string } },
  cdromDiskName: string,
): string => getCdromUploadKey(getCluster(vm), getNamespace(vm), getName(vm), cdromDiskName);

export const getUploadEntriesForVm = (
  uploads: Record<string, MountIsoUploadState>,
  vmKey: string,
): [string, MountIsoUploadState][] =>
  Object.entries(uploads).filter(([key]) => key.startsWith(`${vmKey}/`));

export const useMountIsoUploadStore = create<MountIsoUploadStore>((set, get) => ({
  cancelUploads: {},
  clearCancelUpload: (uploadKey) =>
    set((state) => {
      const nextCancelUploads = { ...state.cancelUploads };
      delete nextCancelUploads[uploadKey];
      return { cancelUploads: nextCancelUploads };
    }),
  clearUpload: (uploadKey) =>
    set((state) => {
      const nextUploads = { ...state.uploads };
      delete nextUploads[uploadKey];
      return { uploads: nextUploads };
    }),
  getCancelUpload: (uploadKey) => get().cancelUploads[uploadKey],
  getUpload: (uploadKey) => get().uploads[uploadKey],
  setCancelUpload: (uploadKey, cancelUpload) =>
    set((state) => ({
      cancelUploads: {
        ...state.cancelUploads,
        [uploadKey]: cancelUpload,
      },
    })),
  setUpload: (uploadKey, uploadState) =>
    set((state) => ({
      uploads: {
        ...state.uploads,
        [uploadKey]: uploadState,
      },
    })),
  uploads: {},
}));
