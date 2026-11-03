import { stripDataVolumeLinksFromUpload } from '../../cancel/stripVmStorageLinks';
import { type UploadsStoreSliceActions } from '../../features/uploads/types/types';
import {
  getSliceEntry,
  getSliceProgressToast,
  getTerminalToastShown,
  getToastId,
} from '../selectors/uploadEntrySelectors';
import { type UploadsActionsParamsWithStoreSlice } from '../types/types';

export const createStripDataVolumeLinks = (
  { set, storeSlice }: UploadsActionsParamsWithStoreSlice,
  uploadKey: string,
): void =>
  set((state) => {
    const current = getSliceProgressToast(state, storeSlice, uploadKey);
    if (!current) {
      return state;
    }

    const nextUpload = stripDataVolumeLinksFromUpload(current, uploadKey);
    if (nextUpload === current) {
      return state;
    }

    const entry = state[storeSlice].data?.[uploadKey];
    return {
      [storeSlice]: {
        ...state[storeSlice],
        data: {
          ...state[storeSlice].data,
          [uploadKey]: { ...entry, progressToastState: nextUpload },
        },
      },
    };
  });

export const createTryMarkTerminalToastShown =
  ({
    get,
    set,
    storeSlice,
  }: UploadsActionsParamsWithStoreSlice): UploadsStoreSliceActions['tryMarkTerminalToastShown'] =>
  (uploadKey): boolean => {
    const currentToast = getSliceEntry(get(), storeSlice, uploadKey);
    if (!currentToast || getTerminalToastShown(currentToast)) {
      return false;
    }

    set((state) => {
      const entry = getSliceEntry(state, storeSlice, uploadKey);
      if (!entry || getTerminalToastShown(entry)) {
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
  }: UploadsActionsParamsWithStoreSlice): UploadsStoreSliceActions['trySetToastId'] =>
  (uploadKey, toastId): boolean => {
    const current = getSliceEntry(get(), storeSlice, uploadKey);
    if (!current || getToastId(current)) {
      return false;
    }

    set((state) => {
      const entry = getSliceEntry(state, storeSlice, uploadKey);
      if (!entry || getToastId(entry)) {
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
