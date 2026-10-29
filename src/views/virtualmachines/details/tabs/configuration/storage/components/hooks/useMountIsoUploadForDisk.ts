import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { UPLOAD_PROGRESS_STATUS } from '@kubevirt-utils/hooks/useInFlightToast/constants';
import { useInFlightToastStore } from '@kubevirt-utils/hooks/useInFlightToast/inFlightToastStore';
import { getVmCdromUploadKeyFromVm } from '@kubevirt-utils/hooks/useInFlightToast/keys/uploadKeys';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

type UseMountIsoUploadForDiskResult = {
  cancelUpload: () => Promise<boolean>;
  isUploadInProgress: boolean;
};

export const cancelMountIsoUpload = async (
  vm: V1VirtualMachine,
  cdromDiskName: string,
): Promise<boolean> => {
  const uploadKey = getVmCdromUploadKeyFromVm(vm, cdromDiskName);
  const { cancelTrackedUpload, getUpload } = useInFlightToastStore.getState().uploads.actions;
  const upload = getUpload(uploadKey);

  if (upload?.status !== UPLOAD_PROGRESS_STATUS.UPLOADING) {
    return false;
  }

  try {
    await cancelTrackedUpload(uploadKey);
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
  const uploadKey = getVmCdromUploadKeyFromVm(vm, diskName);
  const upload = useInFlightToastStore((state) => state.uploads.actions?.getUpload?.(uploadKey));

  const isUploadInProgress = upload?.status === UPLOAD_PROGRESS_STATUS.UPLOADING;

  const cancelUpload = (): Promise<boolean> => cancelMountIsoUpload(vm, diskName);

  return { cancelUpload, isUploadInProgress };
};
