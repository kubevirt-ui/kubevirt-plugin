import { cancelUploadPVC } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { isK8sNotFoundError } from '@kubevirt-utils/resources/errorStatusChecks';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { UPLOAD_PROGRESS_STATUS } from '../constants';
import { type InFlightToastStoreState } from '../types';

import { collectVmScopedUploadKeys } from '../keys/uploadKeys';
import { type ProgressToastState } from '../shared/types/types';

type StoreAccessor = () => InFlightToastStoreState;

type CancelTrackedUploadOptions = {
  removeAfterCancel?: boolean;
};

export const abortUploadStream = async (
  cancelUpload?: ProgressToastState['cancelUpload'],
): Promise<boolean> => {
  if (!cancelUpload) {
    return false;
  }

  try {
    await cancelUpload();
    return true;
  } catch (error) {
    kubevirtConsole.error('Upload cancellation error:', error);
    return false;
  }
};

export const abortViaDataVolume = async (
  dvName?: string,
  dvNamespace?: string,
  dvCluster?: string,
): Promise<boolean> => {
  if (!dvName || !dvNamespace) {
    return false;
  }

  try {
    await cancelUploadPVC(dvName, dvNamespace, dvCluster);
    return true;
  } catch (error) {
    if (isK8sNotFoundError(error)) {
      return true;
    }
    kubevirtConsole.error('Failed to cancel DataVolume upload:', error);
    return false;
  }
};

export const runCancelCleanup = async (
  onCancelCleanup?: ProgressToastState['onCancelCleanup'],
): Promise<void> => {
  if (!onCancelCleanup) {
    return;
  }

  try {
    await onCancelCleanup();
  } catch (error) {
    kubevirtConsole.error('Upload cancel cleanup failed:', error);
  }
};

export const performCancelTrackedUpload = async (
  get: StoreAccessor,
  uploadKey: string,
  { removeAfterCancel = false }: CancelTrackedUploadOptions = {},
): Promise<void> => {
  const upload = get().uploads.data?.[uploadKey];
  if (!upload) {
    return;
  }

  const { cancelUpload, dvCluster, dvName, dvNamespace, generation, onCancelCleanup } =
    upload.progressToastState;

  const aborted =
    (await abortUploadStream(cancelUpload)) ||
    (await abortViaDataVolume(dvName, dvNamespace, dvCluster));

  if (get().uploads.data?.[uploadKey]?.progressToastState.generation !== generation) {
    return;
  }

  const { markUploadCanceled, removeUpload, stripDataVolumeLinks } = get().uploads.actions;

  if (removeAfterCancel && (!cancelUpload || aborted)) {
    removeUpload(uploadKey);
  } else if (!removeAfterCancel) {
    markUploadCanceled(uploadKey, generation);
    if (aborted) {
      stripDataVolumeLinks(uploadKey);
    }
  }

  await runCancelCleanup(onCancelCleanup);
};

const performCancelTrackedUploads = async (
  get: StoreAccessor,
  uploadKeys: string[],
  options?: CancelTrackedUploadOptions,
): Promise<void> => {
  await Promise.allSettled(uploadKeys.map((key) => performCancelTrackedUpload(get, key, options)));
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
