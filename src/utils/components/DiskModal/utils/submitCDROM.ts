import produce from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getVmCdromUploadKeyFromVm } from '@kubevirt-utils/hooks/useUploadProgressToast/utils/uploadKeys';
import { generateUploadDiskName, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { isRunning } from '@virtualmachines/utils';

import { reorderBootDisk } from './bootDiskUtils';
import { produceEmptyDriveData, produceExistingISOData } from './cdromDataProducers';
import { UPLOAD_SUFFIX } from './constants';
import {
  createDetachDiskCancelCleanup,
  createEjectMountedDiskCancelCleanup,
  createMutableUploadData,
  detachDiskFromVM,
  ejectISOFromCDROM,
  mountISOToCDROM,
} from './helpers';
import { addDisk } from './submit';
import { SubmitCDROMInput, V1DiskFormState } from './types';
import { logBackgroundUploadError, runVmCdromBackgroundUpload } from './vmCdromBackgroundUpload';

export const submitCDROM = async (
  data: V1DiskFormState,
  {
    getCurrentVM,
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

  const finalize = (producedData: V1DiskFormState) => {
    const vmWithDisk = addDisk(producedData, vm);
    const updatedVM = reorderBootDisk(
      vmWithDisk,
      producedData.disk.name,
      producedData.isBootSource,
      false,
    );
    return onSubmit(updatedVM);
  };

  if (selectedISO) {
    return finalize(produceExistingISOData(data, selectedISO, isHotPluggable));
  }

  if (uploadISO) {
    const dvName = generateUploadDiskName(data.disk.name, UPLOAD_SUFFIX);
    const diskName = data.disk.name;
    const file = data?.uploadFile?.file;
    const uploadKey = getVmCdromUploadKeyFromVm(vm, diskName);

    // Two cleanup strategies: getCurrentVM reads from an in-memory store (creation wizard),
    // while the fallback re-fetches from the K8s API (details page for persisted VMs).
    const buildCancelCleanup = (vmForCleanup: V1VirtualMachine, name: string) => {
      if (getCurrentVM) {
        const transform = isHotPluggable ? ejectISOFromCDROM : detachDiskFromVM;
        return async () => {
          const currentVM = getCurrentVM();
          if (!currentVM) {
            kubevirtConsole.warn('Cancel cleanup skipped: VM no longer available in local state');
            return;
          }
          await onSubmit(transform(currentVM, name));
        };
      }
      const createCancelCleanup = isHotPluggable
        ? createEjectMountedDiskCancelCleanup
        : createDetachDiskCancelCleanup;
      return createCancelCleanup(vmForCleanup, name);
    };

    const mutableData = {
      ...createMutableUploadData(data),
      uploadFile: { file, filename: file?.name },
    };

    if (vmIsRunning && isHotPluggable) {
      const emptyData = produceEmptyDriveData(data);
      const vmWithEmptyCdrom = addDisk(emptyData, vm);
      const updatedVMWithEmpty = reorderBootDisk(
        vmWithEmptyCdrom,
        diskName,
        data.isBootSource,
        false,
      );

      const submitResult = await onSubmit(updatedVMWithEmpty);
      const vmAfterEmptyAdd = submitResult || updatedVMWithEmpty;

      const runningVmUploadPromise = runVmCdromBackgroundUpload({
        afterUpload: async () => {
          const dataWithVolume = produce(data, (draft) => {
            draft.volume = {
              dataVolume: { hotpluggable: isHotPluggable, name: dvName },
              name: diskName,
            };
            delete draft.dataVolumeTemplate;
          });

          const vmForMount = getCurrentVM?.() ?? vmAfterEmptyAdd;
          const mountedVm = await mountISOToCDROM(vmForMount, dataWithVolume, isHotPluggable);
          await onSubmit(mountedVm);
        },
        diskState: mutableData,
        dvName,
        isHotPluggable,
        onCancelCleanup: buildCancelCleanup(vmAfterEmptyAdd, diskName),
        onUploadedDataVolume,
        t,
        uploadData,
        uploadKey,
        vm,
      }).catch(logBackgroundUploadError);

      onUploadStarted?.(runningVmUploadPromise, diskName);

      return;
    }

    const stoppedVmUploadPromise = runVmCdromBackgroundUpload({
      diskState: mutableData,
      dvName,
      isHotPluggable,
      onCancelCleanup: buildCancelCleanup(vm, diskName),
      onUploadedDataVolume,
      t,
      uploadData,
      uploadKey,
      vm,
    }).catch(logBackgroundUploadError);

    onUploadStarted?.(stoppedVmUploadPromise, diskName);

    const dataWithVolume = produce(data, (draft) => {
      if (!draft.volume) {
        draft.volume = { name: diskName };
      }
      draft.volume.name = diskName;
      draft.volume.persistentVolumeClaim = { claimName: dvName };
      delete draft.volume.dataVolume;
      delete draft.dataVolumeTemplate;
    });

    return finalize(dataWithVolume);
  }

  return finalize(produceEmptyDriveData(data));
};
