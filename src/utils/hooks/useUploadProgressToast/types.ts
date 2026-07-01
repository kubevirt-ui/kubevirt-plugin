import { ReactNode } from 'react';

import { UPLOAD_STATUS, UploadError } from '@kubevirt-utils/hooks/useCDIUpload/types';

import { UPLOAD_PROGRESS_STATUS } from './constants';

export type UploadProgressStatus =
  (typeof UPLOAD_PROGRESS_STATUS)[keyof typeof UPLOAD_PROGRESS_STATUS];

export type UploadSuccessLink = {
  label: ReactNode;
  url: string;
};

export type UploadEntry = {
  abortTooltip?: string;
  cancelUpload?: () => Promise<unknown> | void;
  contextLinks?: UploadSuccessLink[];
  dvCluster?: string;
  dvName?: string;
  dvNamespace?: string;
  errorMessage?: string;
  fileName: string;
  onCancelCleanup?: () => Promise<void>;
  progress: number;
  resourceName?: string;
  resourceUrl?: string;
  status: UploadProgressStatus;
  successLinks?: UploadSuccessLink[];
  terminalToastShown?: boolean;
  toastId?: string;
};

export type StartUploadEntry = Omit<UploadEntry, 'progress' | 'status' | 'toastId'>;

export type CdiUploadTrackMetadata = Partial<
  Pick<
    UploadEntry,
    | 'abortTooltip'
    | 'contextLinks'
    | 'dvCluster'
    | 'dvName'
    | 'dvNamespace'
    | 'onCancelCleanup'
    | 'resourceName'
  >
>;

export type CompleteUploadOptions = {
  resourceName?: string;
  resourceUrl?: string;
  successLinks?: UploadSuccessLink[];
};

export type SyncCdiUploadParams = {
  progress?: number;
  uploadError?: UploadError;
  uploadKey: string;
  uploadStatus?: UPLOAD_STATUS;
};

export type RegisterCdiUploadParams = {
  cancelUpload?: () => Promise<unknown> | void;
  fileName: string;
  metadata?: CdiUploadTrackMetadata;
  uploadKey: string;
};

export type UploadProgressStoreState = {
  cancelAllPendingUploads: () => Promise<void>;
  cancelTrackedUpload: (uploadKey: string) => Promise<void>;
  cancelUploadsForVm: (cluster: string, namespace: string, vmName: string) => Promise<void>;
  completeUpload: (uploadKey: string, options?: CompleteUploadOptions) => void;
  failUpload: (uploadKey: string, errorMessage: string) => void;
  getUpload: (uploadKey: string) => undefined | UploadEntry;
  markUploadCanceled: (uploadKey: string) => void;
  removeUpload: (uploadKey: string) => void;
  startUpload: (uploadKey: string, entry: StartUploadEntry) => void;
  tryMarkTerminalToastShown: (uploadKey: string) => boolean;
  trySetToastId: (uploadKey: string, toastId: string) => boolean;
  updateProgress: (uploadKey: string, progress: number) => void;
  uploads: Record<string, UploadEntry>;
};
