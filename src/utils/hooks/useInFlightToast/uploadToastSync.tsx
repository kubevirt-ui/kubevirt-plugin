import { type TFunction } from 'i18next';

import type useKubevirtToast from '@kubevirt-utils/hooks/useKubevirtToast';

import UploadProgressToastContent from './components/UploadProgressToastContent';
import { UPLOAD_PROGRESS_STATUS } from './constants';
import { type UploadsStoreSliceData } from './features/uploads/types/types';
import { type ProgressToastState } from './shared/types/types';
import { getUploadTitle, isTerminalUploadStatus } from './toast/uploadTitles';
import { type InFlightToastStoreState } from './types';

type ToastActions = ReturnType<typeof useKubevirtToast>;

type UploadToastContext = {
  addDangerToast: ToastActions['addDangerToast'];
  addInfoToast: ToastActions['addInfoToast'];
  addSuccessToast: ToastActions['addSuccessToast'];
  addWarningToast: ToastActions['addWarningToast'];
  cancelTrackedUpload: (uploadKey: string) => void;
  getUpload: (uploadKey: string) => ProgressToastState | undefined;
  navigate: (path: string) => void;
  removeToast: ToastActions['removeToast'];
  removeUpload: (uploadKey: string) => void;
  storeSlice: keyof InFlightToastStoreState;
  t: TFunction;
  tryMarkTerminalToastShown: (uploadKey: string) => boolean;
  trySetToastId: (uploadKey: string, toastId: string) => boolean;
};

export const showInProgressUploadToast = (
  uploadKey: string,
  upload: ProgressToastState,
  context: UploadToastContext,
  processedToasts: Set<string>,
): void => {
  if (upload.toastId || processedToasts.has(uploadKey)) {
    return;
  }

  processedToasts.add(uploadKey);

  const toastId = context.addInfoToast({
    content: (
      <UploadProgressToastContent
        navigate={context.navigate}
        storeSlice={context.storeSlice}
        uploadKey={uploadKey}
      />
    ),
    dismissible: false,
    minimizable: true,
    onClose: () => context.cancelTrackedUpload(uploadKey),
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
  upload: ProgressToastState,
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

  const capturedGeneration = upload.generation;

  const toastOptions = {
    content: (
      <UploadProgressToastContent
        navigate={context.navigate}
        storeSlice={context.storeSlice}
        uploadKey={uploadKey}
        uploadSnapshot={upload}
      />
    ),
    dismissible: true,
    onClose: (): void => {
      const latestUpload = context.getUpload(uploadKey);
      if (latestUpload && latestUpload.generation !== capturedGeneration) {
        return;
      }
      if (latestUpload && !isTerminalUploadStatus(latestUpload.status)) {
        return;
      }
      context.removeUpload(uploadKey);
    },
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
  uploadsData: UploadsStoreSliceData,
  context: UploadToastContext,
  processedToasts: Set<string>,
): void => {
  for (const [uploadKey, uploadDataValue] of Object.entries(uploadsData)) {
    if (uploadDataValue.progressToastState.status === UPLOAD_PROGRESS_STATUS.UPLOADING) {
      showInProgressUploadToast(
        uploadKey,
        uploadDataValue.progressToastState,
        context,
        processedToasts,
      );
      continue;
    }

    processedToasts.delete(uploadKey);
    replaceWithTerminalUploadToast(uploadKey, uploadDataValue.progressToastState, context);
  }
};
