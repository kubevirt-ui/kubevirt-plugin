import React from 'react';
import { TFunction } from 'i18next';

import useKubevirtToast from '@kubevirt-utils/hooks/useKubevirtToast';

import UploadProgressToastContent from './components/UploadProgressToastContent';
import { getUploadTitle, isTerminalUploadStatus } from './toast/uploadTitles';
import { UPLOAD_PROGRESS_STATUS } from './constants';
import { UploadEntry } from './types';

type ToastActions = ReturnType<typeof useKubevirtToast>;

type UploadToastContext = {
  addDangerToast: ToastActions['addDangerToast'];
  addInfoToast: ToastActions['addInfoToast'];
  addSuccessToast: ToastActions['addSuccessToast'];
  addWarningToast: ToastActions['addWarningToast'];
  navigate: (path: string) => void;
  removeToast: ToastActions['removeToast'];
  removeUpload: (uploadKey: string) => void;
  t: TFunction;
  tryMarkTerminalToastShown: (uploadKey: string) => boolean;
  trySetToastId: (uploadKey: string, toastId: string) => boolean;
};

export const showInProgressUploadToast = (
  uploadKey: string,
  upload: UploadEntry,
  context: UploadToastContext,
  processedToasts: Set<string>,
): void => {
  if (upload.toastId || processedToasts.has(uploadKey)) {
    return;
  }

  processedToasts.add(uploadKey);

  const toastId = context.addInfoToast({
    content: <UploadProgressToastContent navigate={context.navigate} uploadKey={uploadKey} />,
    dismissible: false,
    timeout: false,
    title: getUploadTitle(upload, context.t),
  });

  if (!context.trySetToastId(uploadKey, toastId)) {
    context.removeToast(toastId);
    processedToasts.delete(uploadKey);
  }
};

export const replaceWithTerminalUploadToast = (
  uploadKey: string,
  upload: UploadEntry,
  context: UploadToastContext,
): void => {
  if (!isTerminalUploadStatus(upload.status)) {
    return;
  }

  if (upload.terminalToastShown || !context.tryMarkTerminalToastShown(uploadKey)) {
    return;
  }

  if (upload.toastId) {
    context.removeToast(upload.toastId);
  }

  const toastOptions = {
    content: <UploadProgressToastContent navigate={context.navigate} uploadKey={uploadKey} />,
    dismissible: true,
    onClose: () => context.removeUpload(uploadKey),
    timeout: false,
    title: getUploadTitle(upload, context.t),
  };

  if (upload.status === UPLOAD_PROGRESS_STATUS.SUCCESS) {
    context.addSuccessToast(toastOptions);
  } else if (upload.status === UPLOAD_PROGRESS_STATUS.ERROR) {
    context.addDangerToast(toastOptions);
  } else if (upload.status === UPLOAD_PROGRESS_STATUS.CANCELED) {
    context.addWarningToast(toastOptions);
  }
};

export const syncUploadToasts = (
  uploads: Record<string, UploadEntry>,
  context: UploadToastContext,
  processedToasts: Set<string>,
): void => {
  Object.entries(uploads).forEach(([uploadKey, upload]) => {
    if (upload.status === UPLOAD_PROGRESS_STATUS.UPLOADING) {
      showInProgressUploadToast(uploadKey, upload, context, processedToasts);
      return;
    }

    processedToasts.delete(uploadKey);
    replaceWithTerminalUploadToast(uploadKey, upload, context);
  });
};
