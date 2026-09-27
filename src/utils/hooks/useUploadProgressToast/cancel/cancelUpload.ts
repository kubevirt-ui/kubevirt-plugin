import { cancelUploadPVC } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { isK8sNotFoundError } from '@kubevirt-utils/resources/errorStatusChecks';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { UPLOAD_PROGRESS_STATUS } from '../constants';
import { type UploadEntry, type UploadProgressStoreState } from '../types';

import { collectVmScopedUploadKeys } from '../keys/uploadKeys';

type StoreAccessor = () => UploadProgressStoreState;

type UploadProgressSetState = (
  partial:
    | Partial<UploadProgressStoreState>
    | ((state: UploadProgressStoreState) => Partial<UploadProgressStoreState>),
) => void;

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

  const { cancelUpload, dvCluster, dvName, dvNamespace, generation, onCancelCleanup } = upload;

  const aborted =
    (await abortUploadStream(cancelUpload)) ||
    (await abortViaDataVolume(dvName, dvNamespace, dvCluster));

  if (get().uploads[uploadKey]?.generation !== generation) {
    return;
  }

  if (removeAfterCancel && (!cancelUpload || aborted)) {
    get().removeUpload(uploadKey);
  } else if (!removeAfterCancel) {
    get().markUploadCanceled(uploadKey, generation);
    if (aborted) {
      get().stripDataVolumeLinks(uploadKey);
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
  const generationByKey = Object.fromEntries(
    collectVmScopedUploadKeys(get().uploads, cluster, namespace, vmName).map((key) => [
      key,
      get().uploads[key]?.generation,
    ]),
  );
  const matchingKeys = Object.keys(generationByKey).filter(
    (key) => get().uploads[key]?.status === UPLOAD_PROGRESS_STATUS.UPLOADING,
  );

  // Keep canceled entries so the terminal toast can merge stripped links instead of
  // freezing a snapshot that still points at the deleted VM's storage page.
  await performCancelTrackedUploads(get, matchingKeys);
  get().stripVmStorageLinksForVm(
    cluster,
    namespace,
    vmName,
    Object.keys(generationByKey).filter(
      (key) => get().uploads[key]?.generation === generationByKey[key],
    ),
  );
};

export const performClearWizardPendingUploadKeys = async (
  get: StoreAccessor,
  set: UploadProgressSetState,
): Promise<void> => {
  const wizardPendingKeys = [...get().wizardPendingUploadKeys];

  const pendingWizardKeys = wizardPendingKeys.filter(
    (key) => get().uploads[key]?.status === UPLOAD_PROGRESS_STATUS.UPLOADING,
  );

  set({ wizardPendingUploadKeys: [] });
  await performCancelTrackedUploads(get, pendingWizardKeys, { removeAfterCancel: true });
};
