import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useUploadProgressStore } from '@kubevirt-utils/hooks/useUploadProgressToast/uploadProgressStore';
import { UPLOAD_PROGRESS_STATUS } from '@kubevirt-utils/hooks/useUploadProgressToast/utils/constants';
import { getVmCdromUploadKeyFromVm } from '@kubevirt-utils/hooks/useUploadProgressToast/utils/uploadKeys';
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
  const { cancelTrackedUpload, getUpload } = useUploadProgressStore.getState();
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
  const upload = useUploadProgressStore((state) => state.uploads[uploadKey]);

  const isUploadInProgress = upload?.status === UPLOAD_PROGRESS_STATUS.UPLOADING;

  const cancelUpload = () => cancelMountIsoUpload(vm, diskName);

  return { cancelUpload, isUploadInProgress };
};
