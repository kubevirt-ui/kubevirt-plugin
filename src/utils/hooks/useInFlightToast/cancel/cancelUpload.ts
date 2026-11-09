import { UPLOAD_PROGRESS_STATUS, UPLOADS_STORE_SLICE } from '../constants';
import { type InFlightToastStoreState } from '../types';

import { collectVmScopedUploadKeys } from '../keys/uploadKeys';
import { performCancelTrackedUpload } from '../shared/sliceActions/inFlightUploadStartAndCancelActions';
import { type CancelTrackedUploadOptions } from '../shared/types/types';

type StoreAccessor = () => InFlightToastStoreState;

const performCancelTrackedUploads = async (
  get: StoreAccessor,
  uploadKeys: string[],
  options?: CancelTrackedUploadOptions,
): Promise<void> => {
  const deps = { get, storeSlice: UPLOADS_STORE_SLICE } as const;
  await Promise.allSettled(uploadKeys.map((key) => performCancelTrackedUpload(deps, key, options)));
};

export const performCancelUploadsForVm = async (
  get: StoreAccessor,
  cluster: string,
  namespace: string,
  vmName: string,
): Promise<void> => {
  const uploadsData = get().uploads.data;
  const generationByKey = Object.fromEntries(
    collectVmScopedUploadKeys(uploadsData, cluster, namespace, vmName).map((key) => [
      key,
      uploadsData[key]?.progressToastState.generation,
    ]),
  );
  const matchingKeys = Object.keys(generationByKey).filter(
    (key) => uploadsData?.[key]?.progressToastState.status === UPLOAD_PROGRESS_STATUS.UPLOADING,
  );

  // Keep canceled entries so the terminal toast can merge stripped links instead of
  // freezing a snapshot that still points at the deleted VM's storage page.
  await performCancelTrackedUploads(get, matchingKeys);
  get().uploads.actions?.stripVmStorageLinksForVm(
    cluster,
    namespace,
    vmName,
    Object.keys(generationByKey).filter(
      (key) => get().uploads.data?.[key]?.progressToastState.generation === generationByKey[key],
    ),
  );
};

export const performCancelWizardPendingUploads = async (
  get: StoreAccessor,
  uploadKeys: string[],
): Promise<void> => {
  const pendingKeys = uploadKeys.filter(
    (key) =>
      get().uploads.data?.[key]?.progressToastState.status === UPLOAD_PROGRESS_STATUS.UPLOADING,
  );

  await performCancelTrackedUploads(get, pendingKeys, { removeAfterCancel: true });
};
