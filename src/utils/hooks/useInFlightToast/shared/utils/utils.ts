import { type UploadsStoreSliceData } from '../../features/uploads/types/types';

export const mapSliceDataToProgressToastData = <T extends UploadsStoreSliceData>(
  data: T,
): UploadsStoreSliceData =>
  Object.entries(data).reduce<UploadsStoreSliceData>((acc, [uploadKey, entry]) => {
    if (entry?.progressToastState) {
      acc[uploadKey] = { progressToastState: entry.progressToastState };
    }
    return acc;
  }, {});
