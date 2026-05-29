import { useCallback } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getCdromUploadKeyFromVm,
  UPLOAD_ALERT_STATUS,
  useMountIsoUploadStore,
} from '@kubevirt-utils/hooks/mountIsoUploadStore';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

type UseMountIsoUploadForDiskResult = {
  cancelUpload: () => Promise<boolean>;
  isUploadInProgress: boolean;
};

export const cancelMountIsoUpload = async (
  vm: V1VirtualMachine,
  cdromDiskName: string,
): Promise<boolean> => {
  const uploadKey = getCdromUploadKeyFromVm(vm, cdromDiskName);
  const { clearCancelUpload, clearUpload, getCancelUpload, getUpload } =
    useMountIsoUploadStore.getState();
  const upload = getUpload(uploadKey);

  if (upload?.status !== UPLOAD_ALERT_STATUS.UPLOADING) {
    return false;
  }

  const cancelFn = getCancelUpload(uploadKey);
  if (!cancelFn) {
    return false;
  }

  try {
    await cancelFn();
    clearUpload(uploadKey);
    clearCancelUpload(uploadKey);
    return true;
  } catch (error) {
    kubevirtConsole.error(error);
    return false;
  }
};

export const useMountIsoUploadForDisk = (
  vm: V1VirtualMachine,
  diskName: string,
): UseMountIsoUploadForDiskResult => {
  const uploadKey = getCdromUploadKeyFromVm(vm, diskName);
  const upload = useMountIsoUploadStore((state) => state.uploads[uploadKey]);

  const isUploadInProgress = upload?.status === UPLOAD_ALERT_STATUS.UPLOADING;

  const cancelUpload = useCallback(() => cancelMountIsoUpload(vm, diskName), [diskName, vm]);

  return { cancelUpload, isUploadInProgress };
};
