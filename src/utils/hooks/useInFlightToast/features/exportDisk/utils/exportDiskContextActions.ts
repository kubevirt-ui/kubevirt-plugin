import { performCancelTrackedUpload } from '@kubevirt-utils/hooks/useInFlightToast/shared/sliceActions/inFlightUploadStartAndCancelActions';
import { type UploadsActionsParamsWithStoreSlice } from '@kubevirt-utils/hooks/useInFlightToast/shared/types/types';

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
