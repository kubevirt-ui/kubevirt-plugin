import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getVmCdromUploadKeyFromVm } from '@kubevirt-utils/hooks/useUploadProgressToast/keys/uploadKeys';
import { generateUploadDiskName } from '@kubevirt-utils/utils/utils';
import { isRunning } from '@virtualmachines/utils';

import { reorderBootDisk } from './bootDiskUtils';
import {
  produceCdromUploadVolumeState,
  produceEmptyDriveData,
  produceExistingISOData,
} from './cdromDataProducers';
import { UPLOAD_SUFFIX } from './constants';
import {
  createDetachDiskCancelCleanup,
  createEjectMountedDiskCancelCleanup,
  createMutableUploadData,
} from './helpers';
import { addDisk } from './submit';
import { type SubmitCDROMInput, type V1DiskFormState } from './types';
import { logBackgroundUploadError, runVmCdromBackgroundUpload } from './vmCdromBackgroundUpload';

const applyCdromDisk = (producedData: V1DiskFormState, vm: V1VirtualMachine): V1VirtualMachine => {
  const vmWithDisk = addDisk(producedData, vm);
  return reorderBootDisk(vmWithDisk, producedData.disk.name, producedData.isBootSource, false);
};

export const submitCDROM = async (
  data: V1DiskFormState,
  {
    isHotPluggable,
    onSubmit,
    onUploadedDataVolume,
    onUploadStarted,
    selectedISO,
    t,
    uploadData,
    uploadEnabled,
    vm,
  }: SubmitCDROMInput,
): Promise<V1VirtualMachine | void> => {
  const uploadISO = uploadEnabled && data?.uploadFile?.file;
  const vmIsRunning = isRunning(vm);

  const finalize = (producedData: V1DiskFormState): Promise<V1VirtualMachine | void> =>
    onSubmit(applyCdromDisk(producedData, vm));

  if (selectedISO) {
    return finalize(produceExistingISOData(data, selectedISO, isHotPluggable));
  }

  if (uploadISO) {
    const dvName = generateUploadDiskName(data.disk.name, UPLOAD_SUFFIX);
    const diskName = data.disk.name;
    const file = data?.uploadFile?.file;
    const uploadKey = getVmCdromUploadKeyFromVm(vm, diskName);

    const createCancelCleanup = isHotPluggable
      ? createEjectMountedDiskCancelCleanup
      : createDetachDiskCancelCleanup;

    const mutableData = {
      ...createMutableUploadData(data),
      uploadFile: { file, filename: file?.name },
    };

    const updatedVM = applyCdromDisk(
      produceCdromUploadVolumeState(data, diskName, isHotPluggable, vmIsRunning, dvName),
      vm,
    );
    const submitResult = (await onSubmit(updatedVM)) as V1VirtualMachine | undefined;
    const vmAfterSubmit = submitResult ?? updatedVM;

    const uploadPromise = runVmCdromBackgroundUpload({
      diskState: mutableData,
      dvName,
      isHotPluggable,
      onCancelCleanup: createCancelCleanup(vmAfterSubmit, diskName),
      onUploadedDataVolume,
      t,
      uploadData,
      uploadKey,
      vm: vmAfterSubmit,
    }).catch(logBackgroundUploadError);

    onUploadStarted?.(uploadPromise, diskName);

    return submitResult;
  }

  return finalize(produceEmptyDriveData(data));
};
