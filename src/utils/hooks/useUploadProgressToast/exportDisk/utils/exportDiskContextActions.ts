import { performCancelTrackedUpload } from '../../shared/sliceActions/uploadStartAndCancelActions';
import { type UploadsActionsParamsWithStoreSlice } from '../../shared/types/types';

export const clearExportDiskWatchContext = (
  { set }: UploadsActionsParamsWithStoreSlice,
  uploadKey: string,
): void =>
  set((state) => {
    const entry = state.exportDisk.data[uploadKey];
    if (!entry) {
      return state;
    }

    return {
      exportDisk: {
        ...state.exportDisk,
        data: {
          ...state.exportDisk.data,
          [uploadKey]: {
            ...entry,
            context: null,
          },
        },
      },
    };
  });

export const performCancelTrackedExportDiskUpload = async (
  deps: UploadsActionsParamsWithStoreSlice,
  uploadKey: string,
): Promise<void> => {
  await performCancelTrackedUpload(deps, uploadKey);
  clearExportDiskWatchContext(deps, uploadKey);
};
