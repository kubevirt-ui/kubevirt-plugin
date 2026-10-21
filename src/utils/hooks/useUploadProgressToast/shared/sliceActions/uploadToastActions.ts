import { stripDataVolumeLinksFromUpload } from '../../cancel/stripVmStorageLinks';
import { type UploadsStoreStateActions } from '../../uploads/types/types';
import { type UploadsActionsParamsWithStoreSlice } from '../types/types';

export const createStripDataVolumeLinks = (
  { set, storeSlice }: UploadsActionsParamsWithStoreSlice,
  uploadKey: string,
): void =>
  set((state) => {
    const current = state[storeSlice]?.data?.[uploadKey]?.progressToastState;
    if (!current) {
      return state;
    }

    const nextUpload = stripDataVolumeLinksFromUpload(current, uploadKey);
    if (nextUpload === current) {
      return state;
    }

    return {
      [storeSlice]: {
        ...state[storeSlice],
        data: {
          ...state[storeSlice].data,
          [uploadKey]: { progressToastState: nextUpload },
        },
      },
    };
  });

export const createTryMarkTerminalToastShown =
  ({
    get,
    set,
    storeSlice,
  }: UploadsActionsParamsWithStoreSlice): UploadsStoreStateActions['tryMarkTerminalToastShown'] =>
  (uploadKey): boolean => {
    const currentToast = get()[storeSlice].data?.[uploadKey];
    if (!currentToast || currentToast.progressToastState?.terminalToastShown) {
      return false;
    }

    set((state) => {
      const entry = state[storeSlice].data?.[uploadKey];
      if (!entry || entry.progressToastState?.terminalToastShown) {
        return state;
      }
      return {
        [storeSlice]: {
          ...state[storeSlice],
          data: {
            ...state[storeSlice].data,
            [uploadKey]: {
              ...entry,
              progressToastState: { ...entry.progressToastState, terminalToastShown: true },
            },
          },
        },
      };
    });
    return true;
  };

export const createTrySetToastId =
  ({
    get,
    set,
    storeSlice,
  }: UploadsActionsParamsWithStoreSlice): UploadsStoreStateActions['trySetToastId'] =>
  (uploadKey, toastId): boolean => {
    const current = get()[storeSlice].data?.[uploadKey];
    if (!current || current.progressToastState?.toastId) {
      return false;
    }

    set((state) => {
      const entry = state[storeSlice].data?.[uploadKey];
      if (!entry || entry.progressToastState?.toastId) {
        return state;
      }
      return {
        [storeSlice]: {
          ...state[storeSlice],
          data: {
            ...state[storeSlice].data,
            [uploadKey]: {
              ...entry,
              progressToastState: { ...entry.progressToastState, toastId },
            },
          },
        },
      };
    });
    return true;
  };
