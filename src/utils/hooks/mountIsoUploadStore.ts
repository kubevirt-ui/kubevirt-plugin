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
  errorMessage?: string;
  status: UploadAlertStatus;
};

type CancelUploadHandler = () => Promise<unknown> | void;

type MountIsoUploadStore = {
  cancelUploads: Record<string, CancelUploadHandler>;
  clearCancelUpload: (vmKey: string) => void;
  clearUpload: (vmKey: string) => void;
  getCancelUpload: (vmKey: string) => CancelUploadHandler | undefined;
  getUpload: (vmKey: string) => MountIsoUploadState | undefined;
  setCancelUpload: (vmKey: string, cancelUpload: CancelUploadHandler) => void;
  setUpload: (vmKey: string, state: MountIsoUploadState) => void;
  uploads: Record<string, MountIsoUploadState>;
};

export const getVmUploadKey = (cluster: string, namespace: string, vmName: string): string =>
  `${cluster || ''}/${namespace}/${vmName}`;

export const getVmUploadKeyFromVm = (vm: {
  metadata?: { name?: string; namespace?: string };
}): string => getVmUploadKey(getCluster(vm), getNamespace(vm), getName(vm));

export const useMountIsoUploadStore = create<MountIsoUploadStore>((set, get) => ({
  cancelUploads: {},
  clearCancelUpload: (vmKey) =>
    set((state) => {
      const nextCancelUploads = { ...state.cancelUploads };
      delete nextCancelUploads[vmKey];
      return { cancelUploads: nextCancelUploads };
    }),
  clearUpload: (vmKey) =>
    set((state) => {
      const nextUploads = { ...state.uploads };
      delete nextUploads[vmKey];
      return { uploads: nextUploads };
    }),
  getCancelUpload: (vmKey) => get().cancelUploads[vmKey],
  getUpload: (vmKey) => get().uploads[vmKey],
  setCancelUpload: (vmKey, cancelUpload) =>
    set((state) => ({
      cancelUploads: {
        ...state.cancelUploads,
        [vmKey]: cancelUpload,
      },
    })),
  setUpload: (vmKey, uploadState) =>
    set((state) => ({
      uploads: {
        ...state.uploads,
        [vmKey]: uploadState,
      },
    })),
  uploads: {},
}));
