import { type UploadEntry } from '../types';

export const resolveToastUpload = (
  uploadSnapshot: UploadEntry | undefined,
  storeUpload: UploadEntry | undefined,
): UploadEntry | undefined => {
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
