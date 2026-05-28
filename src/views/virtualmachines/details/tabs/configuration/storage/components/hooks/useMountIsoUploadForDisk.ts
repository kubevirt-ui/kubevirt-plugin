import { useCallback } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getVmUploadKeyFromVm,
  UPLOAD_ALERT_STATUS,
  useMountIsoUploadStore,
} from '@kubevirt-utils/hooks/mountIsoUploadStore';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

type UseMountIsoUploadForDiskResult = {
  cancelUpload: () => Promise<void>;
  isUploadInProgress: boolean;
};

export const cancelMountIsoUpload = async (
  vm: V1VirtualMachine,
  cdromDiskName: string,
): Promise<void> => {
  const vmKey = getVmUploadKeyFromVm(vm);
  const { clearCancelUpload, clearUpload, getCancelUpload, getUpload } =
    useMountIsoUploadStore.getState();
  const upload = getUpload(vmKey);

  if (upload?.status !== UPLOAD_ALERT_STATUS.UPLOADING || upload.cdromDiskName !== cdromDiskName) {
    return;
  }

  const cancelFn = getCancelUpload(vmKey);
  if (!cancelFn) {
    return;
  }

  try {
    await cancelFn();
    clearUpload(vmKey);
    clearCancelUpload(vmKey);
  } catch (error) {
    kubevirtConsole.error(error);
  }
};

export const useMountIsoUploadForDisk = (
  vm: V1VirtualMachine,
  diskName: string,
): UseMountIsoUploadForDiskResult => {
  const vmKey = getVmUploadKeyFromVm(vm);
  const upload = useMountIsoUploadStore((state) => state.uploads[vmKey]);

  const isUploadInProgress =
    upload?.status === UPLOAD_ALERT_STATUS.UPLOADING && upload.cdromDiskName === diskName;

  const cancelUpload = useCallback(() => cancelMountIsoUpload(vm, diskName), [diskName, vm]);

  return { cancelUpload, isUploadInProgress };
};
