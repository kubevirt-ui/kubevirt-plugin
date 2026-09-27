import { UPLOAD_PROGRESS_STATUS } from '../constants';
import { type StartUploadEntry, type UploadProgressStoreState } from '../types';

import { stripDataVolumeLinksFromUpload } from '../cancel/stripVmStorageLinks';

type StoreAccessor = () => UploadProgressStoreState;

type UploadProgressSetState = (
  partial:
    | Partial<UploadProgressStoreState>
    | ((state: UploadProgressStoreState) => Partial<UploadProgressStoreState>),
) => void;

export const performStartUpload = (
  get: StoreAccessor,
  set: UploadProgressSetState,
  uploadKey: string,
  entry: StartUploadEntry,
): number => {
  const generation = (get().generationsByKey[uploadKey] ?? 0) + 1;
  set((state) => ({
    generationsByKey: { ...state.generationsByKey, [uploadKey]: generation },
    uploads: {
      ...state.uploads,
      [uploadKey]: {
        blockNavigation: true,
        ...entry,
        generation,
        progress: 0,
        status: UPLOAD_PROGRESS_STATUS.UPLOADING,
      },
    },
  }));
  return generation;
};

export const performStripDataVolumeLinks = (
  set: UploadProgressSetState,
  uploadKey: string,
): void => {
  set((state) => {
    const current = state.uploads[uploadKey];
    if (!current) {
      return state;
    }

    const nextUpload = stripDataVolumeLinksFromUpload(current, uploadKey);
    if (nextUpload === current) {
      return state;
    }

    return {
      uploads: {
        ...state.uploads,
        [uploadKey]: nextUpload,
      },
    };
  });
};

export const performTryMarkTerminalToastShown = (
  get: StoreAccessor,
  set: UploadProgressSetState,
  uploadKey: string,
): boolean => {
  const current = get().uploads[uploadKey];
  if (!current || current.terminalToastShown) {
    return false;
  }

  set((state) => {
    const entry = state.uploads[uploadKey];
    if (!entry || entry.terminalToastShown) {
      return state;
    }
    return {
      uploads: {
        ...state.uploads,
        [uploadKey]: { ...entry, terminalToastShown: true },
      },
    };
  });
  return true;
};

export const performTrySetToastId = (
  get: StoreAccessor,
  set: UploadProgressSetState,
  uploadKey: string,
  toastId: string,
): boolean => {
  const current = get().uploads[uploadKey];
  if (!current || current.toastId) {
    return false;
  }

  set((state) => {
    const entry = state.uploads[uploadKey];
    if (!entry || entry.toastId) {
      return state;
    }
    return {
      uploads: {
        ...state.uploads,
        [uploadKey]: { ...entry, toastId },
      },
    };
  });
  return true;
};

export const performUpdateProgress = (
  set: UploadProgressSetState,
  uploadKey: string,
  progress: number,
): void => {
  set((state) => {
    const current = state.uploads[uploadKey];
    if (current?.status !== UPLOAD_PROGRESS_STATUS.UPLOADING) {
      return state;
    }

    return {
      uploads: {
        ...state.uploads,
        [uploadKey]: { ...current, progress },
      },
    };
  });
};

export const addWizardPendingUploadKey = (
  wizardPendingUploadKeys: string[],
  uploadKey: string,
): string[] => {
  if (!uploadKey || wizardPendingUploadKeys.includes(uploadKey)) {
    return wizardPendingUploadKeys;
  }

  return [...wizardPendingUploadKeys, uploadKey];
};
