import { type TFunction } from 'i18next';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  createEjectMountedDiskCancelCleanup,
  mountISOToCDROM,
} from '@kubevirt-utils/components/DiskModal/utils/helpers';
import {
  logBackgroundUploadError,
  runVmCdromBackgroundUpload,
} from '@kubevirt-utils/components/DiskModal/utils/vmCdromBackgroundUpload';
import { type UploadDataProps } from '@kubevirt-utils/hooks/useCDIUpload/types';
import { getName } from '@kubevirt-utils/resources/shared';
import {
  getDataVolumeName,
  getPVCClaimName,
} from '@kubevirt-utils/resources/vm/utils/disk/selectors';

import { buildDiskState, produceMountUploadVolumeState } from '../diskStateBuilders';

export type MountCDROMSubmitParams = {
  cdromName: string;
  cdromUploadKey: string;
  checkUploadReady: () => Promise<void>;
  isHotPluggable: boolean;
  isVMRunning: boolean;
  onClose: () => void;
  onSubmit?: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  selectedISO: string;
  t: TFunction;
  uploadData: (props: UploadDataProps) => Promise<void>;
  uploadFile?: { file: File; filename: string };
  uploadFilename: string;
  uploadMode: string;
  vm: V1VirtualMachine;
};

export const submitMountCDROM = async ({
  cdromName,
  cdromUploadKey,
  checkUploadReady,
  isHotPluggable,
  isVMRunning,
  onClose,
  onSubmit,
  selectedISO,
  t,
  uploadData,
  uploadFile,
  uploadFilename,
  uploadMode,
  vm,
}: MountCDROMSubmitParams): Promise<V1VirtualMachine | void> => {
  const diskState = buildDiskState(
    uploadMode,
    selectedISO,
    uploadFile?.file,
    vm,
    cdromName,
    uploadFilename,
  );

  if (!diskState) {
    return;
  }

  if (uploadFile?.file) {
    await checkUploadReady();

    const diskStateForMount = produceMountUploadVolumeState(
      diskState,
      cdromName,
      isHotPluggable,
      isVMRunning,
    );
    const dvName =
      getName(diskState.dataVolumeTemplate) ??
      getDataVolumeName(diskState.volume) ??
      getPVCClaimName(diskState.volume);

    const vmWithMountedDv = await mountISOToCDROM(vm, diskStateForMount, isHotPluggable);
    const submitResult = await onSubmit?.(vmWithMountedDv);
    const vmAfterMount = submitResult ?? vmWithMountedDv;

    runVmCdromBackgroundUpload({
      diskState,
      dvName,
      isHotPluggable,
      onCancelCleanup: createEjectMountedDiskCancelCleanup(vmAfterMount, cdromName),
      t,
      uploadData,
      uploadKey: cdromUploadKey,
      vm: vmAfterMount,
    }).catch(logBackgroundUploadError);

    onClose();
    return;
  }

  if (selectedISO) {
    delete diskState.dataVolumeTemplate;
  }

  const updatedVM = await mountISOToCDROM(vm, diskState, isHotPluggable);
  return onSubmit?.(updatedVM);
};
