import { cancelUploadPVC } from '@kubevirt-utils/hooks/useCDIUpload/utils';

import { UPLOAD_PROGRESS_STATUS } from '../constants';

import { getDataVolumeUrl } from '../completion/uploadLinks';
import {
  CLUSTER,
  DV_NAME,
  ERROR_CANCEL_FAILED,
  FILE_IMAGE_ISO,
  LINK_LABEL_VIEW_DISK,
  LINK_URL_DISK,
  MISSING_KEY,
  NAMESPACE,
  type SliceTestHelper,
  UPLOAD_KEY,
} from './inFlightToastStore.test';

export const describeCancelTrackedUpload = (slice: SliceTestHelper): void => {
  it('should call cancelUpload, mark canceled, and run onCancelCleanup in order', async () => {
    const callOrder: string[] = [];
    const cancelUpload = jest.fn(async () => {
      callOrder.push('cancelUpload');
    });
    const onCancelCleanup = jest.fn(async () => {
      callOrder.push('onCancelCleanup');
    });

    slice.startUpload(UPLOAD_KEY, {
      cancelUpload,
      fileName: FILE_IMAGE_ISO,
      onCancelCleanup,
    });

    await slice.getActions()?.cancelTrackedUpload(UPLOAD_KEY);

    expect(cancelUpload).toHaveBeenCalledTimes(1);
    expect(onCancelCleanup).toHaveBeenCalledTimes(1);
    expect(callOrder).toEqual(['cancelUpload', 'onCancelCleanup']);
    expect(slice.getActions()?.getUpload(UPLOAD_KEY)?.status).toBe(UPLOAD_PROGRESS_STATUS.CANCELED);
  });

  it('should fall back to cancelUploadPVC when cancelUpload fails', async () => {
    const cancelUpload = jest.fn(async () => {
      throw new Error(ERROR_CANCEL_FAILED);
    });

    slice.startUpload(UPLOAD_KEY, {
      cancelUpload,
      dvCluster: CLUSTER,
      dvName: DV_NAME,
      dvNamespace: NAMESPACE,
      fileName: FILE_IMAGE_ISO,
    });

    await slice.getActions()?.cancelTrackedUpload(UPLOAD_KEY);

    expect(cancelUploadPVC).toHaveBeenCalledWith(DV_NAME, NAMESPACE, CLUSTER);
    expect(slice.getActions()?.getUpload(UPLOAD_KEY)?.status).toBe(UPLOAD_PROGRESS_STATUS.CANCELED);
  });

  it('should treat 404 from cancelUploadPVC as successful cancellation', async () => {
    const cancelUpload = jest.fn(async () => {
      throw new Error(ERROR_CANCEL_FAILED);
    });
    (cancelUploadPVC as jest.Mock).mockRejectedValueOnce({ code: 404 });

    slice.startUpload(UPLOAD_KEY, {
      cancelUpload,
      dvCluster: CLUSTER,
      dvName: DV_NAME,
      dvNamespace: NAMESPACE,
      fileName: FILE_IMAGE_ISO,
    });

    await slice.getActions()?.cancelTrackedUpload(UPLOAD_KEY);

    expect(cancelUploadPVC).toHaveBeenCalledWith(DV_NAME, NAMESPACE, CLUSTER);
    expect(slice.getActions()?.getUpload(UPLOAD_KEY)?.status).toBe(UPLOAD_PROGRESS_STATUS.CANCELED);
  });

  it('should strip DataVolume links when cancellation succeeds', async () => {
    const dataVolumeLink = {
      label: 'View DataVolume',
      url: getDataVolumeUrl(DV_NAME, NAMESPACE),
    };
    const storageLink = { label: LINK_LABEL_VIEW_DISK, url: LINK_URL_DISK };
    const cancelUpload = jest.fn(async () => undefined);

    slice.startUpload(UPLOAD_KEY, {
      cancelUpload,
      contextLinks: [storageLink, dataVolumeLink],
      dvName: DV_NAME,
      dvNamespace: NAMESPACE,
      fileName: FILE_IMAGE_ISO,
    });

    await slice.getActions()?.cancelTrackedUpload(UPLOAD_KEY);

    expect(slice.getActions()?.getUpload(UPLOAD_KEY)?.contextLinks).toEqual([storageLink]);
  });

  it('should no-op when upload key does not exist', async () => {
    await slice.getActions()?.cancelTrackedUpload(MISSING_KEY);

    expect(cancelUploadPVC).not.toHaveBeenCalled();
  });

  it('should not cancel a retried upload after the original abort completes', async () => {
    let resolveCancel: () => void = () => undefined;
    const cancelUpload = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveCancel = resolve;
        }),
    );

    slice.startUpload(UPLOAD_KEY, {
      cancelUpload,
      fileName: FILE_IMAGE_ISO,
    });

    const cancelPromise = slice.getActions()?.cancelTrackedUpload(UPLOAD_KEY);
    slice.startUpload(UPLOAD_KEY, { fileName: 'retry.iso' });

    resolveCancel();
    await cancelPromise;

    const upload = slice.getActions()?.getUpload(UPLOAD_KEY);
    expect(upload?.fileName).toBe('retry.iso');
    expect(upload?.generation).toBe(2);
    expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
  });
};
