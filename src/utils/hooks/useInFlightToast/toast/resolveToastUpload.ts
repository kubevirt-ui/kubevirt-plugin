import { type ProgressToastState } from '../shared/types/types';

export const resolveToastUpload = (
  uploadSnapshot: ProgressToastState | undefined,
  storeUpload: ProgressToastState | undefined,
): ProgressToastState | undefined => {
  if (!uploadSnapshot) {
    return storeUpload;
  }

  if (storeUpload && storeUpload.generation === uploadSnapshot.generation) {
    return {
      ...uploadSnapshot,
      contextLinks: storeUpload.contextLinks,
      successLinks: storeUpload.successLinks,
    };
  }

  return uploadSnapshot;
};
