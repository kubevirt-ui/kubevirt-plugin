import produce from 'immer';

import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { UploadDataProps } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import {
  getBootDisk,
  getDataVolumeTemplates,
  getDisks,
  getVolumes,
} from '@kubevirt-utils/resources/vm';
import { ensurePath, generateUploadDiskName, isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { isRunning } from '@virtualmachines/utils';

import { getDataVolumeTemplateSize } from '../components/utils/selectors';

import { DEFAULT_DISK_SIZE, UPLOAD_SUFFIX } from './constants';
import {
  createDataVolumeName,
  getEmptyVMDataVolumeResource,
  hotplugPromise,
  produceVMDisks,
} from './helpers';
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

  dataVolume.metadata.name = generateUploadDiskName(data.disk.name, UPLOAD_SUFFIX);

  dataVolume.spec.source = { upload: {} };
  dataVolume.spec.storage.resources.requests.storage =
    getDataVolumeTemplateSize(data) || DEFAULT_DISK_SIZE;

  await uploadData({
    dataVolume,
    file: data?.uploadFile?.file,
  });
  if (data?.dataVolumeTemplate?.spec?.source?.upload) {
    delete data.dataVolumeTemplate.spec.source.upload;
  }

  return dataVolume;
};

export const editDisk = (data: V1DiskFormState, diskName: string, vm: V1VirtualMachine) => {
  const volumes = getVolumes(vm);
  const diskIndex = getDisks(vm)?.findIndex((disk) => disk.name === diskName);
  const volumeIndex = volumes?.findIndex((volume) => volume.name === diskName);
  const dataVolumeTemplateIndex = getDataVolumeTemplates(vm)?.findIndex(
    (dv) => getName(dv) === volumes[volumeIndex]?.dataVolume?.name,
  );

  return produceVMDisks(vm, (draftVM: V1VirtualMachine) => {
    draftVM.spec.template.spec.domain.devices.disks.splice(diskIndex, 1, data.disk);
    if (volumeIndex >= 0) {
      draftVM.spec.template.spec.volumes.splice(volumeIndex, 1, data.volume);
    }
    if (dataVolumeTemplateIndex >= 0)
      draftVM.spec.dataVolumeTemplates.splice(dataVolumeTemplateIndex, 1, data.dataVolumeTemplate);
  });
};

export const addDisk = (data: V1DiskFormState, vm: V1VirtualMachine) => {
  return produceVMDisks(vm, (draftVM: V1VirtualMachine) => {
    draftVM.spec.template.spec.domain.devices.disks.push(data.disk);
    if (data.volume) draftVM.spec.template.spec.volumes.push(data.volume);
    if (data.dataVolumeTemplate) draftVM.spec.dataVolumeTemplates.push(data.dataVolumeTemplate);
  });
};

type SubmitInput = {
  data: V1DiskFormState;
  editDiskName: string;
  isHotpluggable?: boolean;
  onSubmit: (
    updatedVM: V1VirtualMachine,
    diskFormState?: V1DiskFormState,
  ) => Promise<V1VirtualMachine | void>;
  pvc?: IoK8sApiCoreV1PersistentVolumeClaim;
  vm: V1VirtualMachine;
};

export const submit = async ({
  data,
  editDiskName,
  isHotpluggable = false,
  onSubmit,
  pvc,
  vm,
}: SubmitInput) => {
  const isVMRunning = isRunning(vm);
  const isEditDisk = !isEmpty(editDiskName);
  const isCreatingDisk = isEmpty(editDiskName);
  const shouldHotplug = isVMRunning && isCreatingDisk && isEmpty(data.volume.containerDisk);

  const isInitialBootDisk = getBootDisk(vm)?.name === editDiskName;

  if (isCreatingDisk && data.volume.dataVolume && data.dataVolumeTemplate?.metadata) {
    const newDataVolumeName = createDataVolumeName(vm, data.disk.name);
    data.volume.dataVolume.name = newDataVolumeName;
    data.dataVolumeTemplate.metadata.name = newDataVolumeName;
  }

  if (data?.disk?.cdrom && isHotpluggable) {
    ensurePath(data, ['volume.persistentVolumeClaim']);
    data.volume.persistentVolumeClaim.hotpluggable = true;
  }

  const vmWithDisk = isEditDisk ? editDisk(data, editDiskName, vm) : addDisk(data, vm);

  const newVM = reorderBootDisk(vmWithDisk, data.disk.name, data.isBootSource, isInitialBootDisk);

  if (data.expandPVCSize && pvc) {
    await kubevirtK8sPatch({
      cluster: getCluster(vm),
      data: [
        {
          op: 'replace',
          path: '/spec/resources/requests',
          value: { storage: data.expandPVCSize },
        },
      ],
      model: PersistentVolumeClaimModel,
      resource: pvc,
    });
  }

  return shouldHotplug ? (hotplugPromise(newVM, data) as Promise<any>) : onSubmit(newVM, data);
};
