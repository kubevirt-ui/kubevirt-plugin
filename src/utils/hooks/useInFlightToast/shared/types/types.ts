import { type ReactNode } from 'react';

import { type K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk';

import { type UPLOAD_PROGRESS_STATUS } from '../../constants';
import { type InFlightToastStoreActionsParams, type InFlightToastStoreState } from '../../types';

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

export type CompleteUploadOptions = {
  expectedGeneration?: number;
  resourceName?: string;
  resourceUrl?: string;
  successLinks?: UploadSuccessLink[];
};

export type UploadProgressStatus =
  (typeof UPLOAD_PROGRESS_STATUS)[keyof typeof UPLOAD_PROGRESS_STATUS];

export type StartUploadEntry = Omit<
  ProgressToastState,
  'generation' | 'progress' | 'status' | 'toastId'
>;

export type ProgressToastState = {
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
export type InFlightToastStoreActions = {
  cancelTrackedUpload: (uploadKey: string) => Promise<void>;
  completeUpload: (uploadKey: string, options?: CompleteUploadOptions) => void;
  failUpload: (uploadKey: string, errorMessage: string, expectedGeneration?: number) => void;
  getUpload: (uploadKey: string) => undefined | ProgressToastState;
  markUploadCanceled: (uploadKey: string, expectedGeneration?: number) => void;
  removeUpload: (uploadKey: string) => void;
  startUpload: (uploadKey: string, entry: StartUploadEntry) => number;
  stripDataVolumeLinks: (uploadKey: string) => void;
  tryMarkTerminalToastShown: (uploadKey: string) => boolean;
  trySetToastId: (uploadKey: string, toastId: string) => boolean;
  updateProgress: (uploadKey: string, progress: number) => void;
};

export type ProgressToastStateParams = {
  progressToastState: ProgressToastState;
};

export type CancelTrackedUploadOptions = {
  removeAfterCancel?: boolean;
};

export type UploadsActionsParamsWithStoreSlice = InFlightToastStoreActionsParams & {
  storeSlice: keyof InFlightToastStoreState;
};
