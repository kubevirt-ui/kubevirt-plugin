import { cancelUploadPVC } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { isK8sNotFoundError } from '@kubevirt-utils/resources/errorStatusChecks';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { UPLOAD_PROGRESS_STATUS } from '../constants';
import { collectVmScopedUploadKeys } from '../keys/uploadKeys';
import { UploadEntry, UploadProgressStoreState } from '../types';

type StoreAccessor = () => UploadProgressStoreState;

type CancelTrackedUploadOptions = {
  removeAfterCancel?: boolean;
};

const abortUploadStream = async (cancelUpload?: UploadEntry['cancelUpload']): Promise<boolean> => {
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

const abortViaDataVolume = async (
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

const runCancelCleanup = async (
  onCancelCleanup?: UploadEntry['onCancelCleanup'],
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
  const upload = get().uploads[uploadKey];
  if (!upload) {
    return;
  }

  const { cancelUpload, dvCluster, dvName, dvNamespace, onCancelCleanup } = upload;

  const aborted =
    (await abortUploadStream(cancelUpload)) ||
    (await abortViaDataVolume(dvName, dvNamespace, dvCluster));

  if (removeAfterCancel && (!cancelUpload || aborted)) {
    get().removeUpload(uploadKey);
  } else if (!removeAfterCancel) {
    get().markUploadCanceled(uploadKey);
  }

  await runCancelCleanup(onCancelCleanup);
};

const performCancelTrackedUploads = async (
  get: StoreAccessor,
  uploadKeys: string[],
): Promise<void> => {
  await Promise.allSettled(
    uploadKeys.map((key) => performCancelTrackedUpload(get, key, { removeAfterCancel: true })),
  );
};

export const performCancelUploadsForVm = async (
  get: StoreAccessor,
  cluster: string,
  namespace: string,
  vmName: string,
): Promise<void> => {
  const matchingKeys = collectVmScopedUploadKeys(get().uploads, cluster, namespace, vmName).filter(
    (key) => get().uploads[key]?.status === UPLOAD_PROGRESS_STATUS.UPLOADING,
  );

  await performCancelTrackedUploads(get, matchingKeys);
};

// Used when the VM creation wizard is closed. Cancels every in-progress upload, including
// bootable-volume uploads that are not tied to a draft VM via vm-scoped keys.
export const performCancelAllPendingUploads = async (get: StoreAccessor): Promise<void> => {
  const pendingKeys = Object.entries(get().uploads)
    .filter(([, upload]) => upload.status === UPLOAD_PROGRESS_STATUS.UPLOADING)
    .map(([uploadKey]) => uploadKey);

  await performCancelTrackedUploads(get, pendingKeys);
};
