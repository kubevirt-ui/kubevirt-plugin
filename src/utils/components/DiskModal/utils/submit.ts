import produce from 'immer';

import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { UploadDataProps } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { getName } from '@kubevirt-utils/resources/shared';
import {
  getBootDisk,
  getDataVolumeTemplates,
  getDisks,
  getVolumes,
} from '@kubevirt-utils/resources/vm';
import { generatePrettyName, isEmpty } from '@kubevirt-utils/utils/utils';
import { isRunning } from '@virtualmachines/utils';

import { getDataVolumeTemplateSize } from '../components/utils/selectors';

import { DEFAULT_DISK_SIZE } from './constants';
import { getEmptyVMDataVolumeResource, hotplugPromise, produceVMDisks } from './helpers';
import { V1DiskFormState } from './types';

const applyDiskAsBootable = (vm: V1VirtualMachine, diskName: string): V1VirtualMachine => {
  return produce(vm, (draftVM) => {
    const disks = getDisks(draftVM);

    disks.forEach((disk, index) => {
      if (disk.name === diskName) {
        disk.bootOrder = 1;
        return;
      }

      disk.bootOrder = index + 2;
    });
  });
};

const removeDiskAsBootable = (vm: V1VirtualMachine, diskName: string): V1VirtualMachine => {
  return produce(vm, (draftVM) => {
    const disks = getDisks(draftVM);
    const disk = disks.find((d) => d.name === diskName);

    if (disk) delete disk.bootOrder;

    const nextBootDisk = disks.find((d) => d.name !== diskName);
    if (nextBootDisk) {
      nextBootDisk.bootOrder = 1;
    }
  });
};

export const reorderBootDisk = (
  vm: V1VirtualMachine,
  diskName: string,
  isBootDisk: boolean,
  initialBootDisk: boolean,
) => {
  if (isBootDisk === initialBootDisk) return vm;

  return isBootDisk ? applyDiskAsBootable(vm, diskName) : removeDiskAsBootable(vm, diskName);
};

export const uploadDataVolume = async (
  vm: V1VirtualMachine,
  uploadData: ({ dataVolume, file }: UploadDataProps) => Promise<void>,
  data: V1DiskFormState,
): Promise<V1beta1DataVolume> => {
  const dataVolume = getEmptyVMDataVolumeResource(vm);

  dataVolume.metadata.name = generatePrettyName('upload');

  dataVolume.spec.source = { upload: {} };
  dataVolume.spec.storage.resources.requests.storage =
    getDataVolumeTemplateSize(data) || DEFAULT_DISK_SIZE;

  await uploadData({
    dataVolume,
    file: data?.uploadFile?.file,
  });

  delete data.dataVolumeTemplate.spec.source.upload;

  return dataVolume;
};

export const editDisk = (data: V1DiskFormState, diskName: string, vm: V1VirtualMachine) => {
  const volumes = getVolumes(vm);
  const diskindex = getDisks(vm)?.findIndex((disk) => disk.name === diskName);
  const volumeindex = getVolumes(vm)?.findIndex((volume) => volume.name === diskName);
  const dataVolumeTemplateindex = getDataVolumeTemplates(vm)?.findIndex(
    (dv) => getName(dv) === volumes[volumeindex]?.dataVolume?.name,
  );

  return produceVMDisks(vm, (draftVM: V1VirtualMachine) => {
    draftVM.spec.template.spec.domain.devices.disks.splice(diskindex, 1, data.disk);
    draftVM.spec.template.spec.volumes.splice(volumeindex, 1, data.volume);

    if (dataVolumeTemplateindex >= 0)
      draftVM.spec.dataVolumeTemplates.splice(dataVolumeTemplateindex, 1, data.dataVolumeTemplate);
  });
};

export const addDisk = (data: V1DiskFormState, vm: V1VirtualMachine) => {
  return produceVMDisks(vm, (draftVM: V1VirtualMachine) => {
    draftVM.spec.template.spec.domain.devices.disks.push(data.disk);
    draftVM.spec.template.spec.volumes.push(data.volume);

    if (data.dataVolumeTemplate) draftVM.spec.dataVolumeTemplates.push(data.dataVolumeTemplate);
  });
};

export const submit = (
  data: V1DiskFormState,
  vm: V1VirtualMachine,
  editDiskName: string,
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>,
) => {
  const isVMRunning = isRunning(vm);

  const isEditDisk = !isEmpty(editDiskName);
  const isInitialBootDisk = getBootDisk(vm)?.name === editDiskName;

  const vmWithDisk = isEditDisk ? editDisk(data, editDiskName, vm) : addDisk(data, vm);

  const newVM = reorderBootDisk(vmWithDisk, data.disk.name, data.isBootSource, isInitialBootDisk);

  return !isVMRunning ? onSubmit(newVM) : (hotplugPromise(newVM, data) as Promise<any>);
};
