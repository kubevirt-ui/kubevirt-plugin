import { type UploadsStoreStateData } from '../../uploads/types/types';

export const mapSliceDataToProgressToastData = <T extends UploadsStoreStateData>(
  data: T,
): UploadsStoreStateData =>
  Object.entries(data).reduce<UploadsStoreStateData>((acc, [uploadKey, entry]) => {
    if (entry?.progressToastState) {
      acc[uploadKey] = { progressToastState: entry.progressToastState };
    }
    return acc;
  }, {});
