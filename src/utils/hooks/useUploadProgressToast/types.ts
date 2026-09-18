import { type ReactNode } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type UPLOAD_STATUS, type UploadError } from '@kubevirt-utils/hooks/useCDIUpload/types';
import type { K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk';

import { type UPLOAD_PROGRESS_STATUS } from './constants';

export type UploadProgressStatus =
  (typeof UPLOAD_PROGRESS_STATUS)[keyof typeof UPLOAD_PROGRESS_STATUS];

export type UploadLinkedResource = {
  cluster?: string;
  groupVersionKind: K8sGroupVersionKind;
  name: string;
  namespace?: string;
};

export type UploadSuccessLink = {
  label: ReactNode;
  resource?: UploadLinkedResource;
  url: string;
};

export type UploadEntry = {
  abortTooltip?: string;
  blockNavigation?: boolean;
  cancelUpload?: () => Promise<unknown> | void;
  contextLinks?: UploadSuccessLink[];
  dvCluster?: string;
  dvName?: string;
  dvNamespace?: string;
  errorMessage?: string;
  fileName: string;
  generation?: number;
  omittedLinkUrls?: string[];
  onCancelCleanup?: () => Promise<void>;
  progress: number;
  resourceName?: string;
  resourceUrl?: string;
  status: UploadProgressStatus;
  successLinks?: UploadSuccessLink[];
  terminalToastShown?: boolean;
  toastId?: string;
};

export type StartUploadEntry = Omit<UploadEntry, 'generation' | 'progress' | 'status' | 'toastId'>;

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
  expectedGeneration?: number;
  resourceName?: string;
  resourceUrl?: string;
  successLinks?: UploadSuccessLink[];
};

export type SyncCdiUploadParams = {
  expectedGeneration?: number;
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
  cancelTrackedUpload: (uploadKey: string) => Promise<void>;
  cancelUploadsForVm: (cluster: string, namespace: string, vmName: string) => Promise<void>;
  cancelWizardPendingUploads: (
    wizardVm?: V1VirtualMachine,
    wizardBootableVolumeKeys?: string[],
  ) => Promise<void>;
  completeUpload: (uploadKey: string, options?: CompleteUploadOptions) => void;
  failUpload: (uploadKey: string, errorMessage: string, expectedGeneration?: number) => void;
  generationsByKey: Record<string, number>;
  getUpload: (uploadKey: string) => undefined | UploadEntry;
  markUploadCanceled: (uploadKey: string, expectedGeneration?: number) => void;
  removeUpload: (uploadKey: string) => void;
  startUpload: (uploadKey: string, entry: StartUploadEntry) => number;
  stripBootableVolumeLinks: (namespace: string, name: string, cluster?: string) => void;
  stripDataVolumeLinks: (uploadKey: string) => void;
  stripDataVolumeLinksForResource: (dvName: string, dvNamespace: string, cluster?: string) => void;
  stripVmStorageLinksForVm: (
    cluster: string,
    namespace: string,
    vmName: string,
    uploadKeys?: string[],
  ) => void;
  tryMarkTerminalToastShown: (uploadKey: string) => boolean;
  trySetToastId: (uploadKey: string, toastId: string) => boolean;
  updateProgress: (uploadKey: string, progress: number) => void;
  uploads: Record<string, UploadEntry>;
};
