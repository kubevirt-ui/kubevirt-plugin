import { TFunction } from 'i18next';
import produce from 'immer';

import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { TELEMETRY_HOTPLUG_OPERATION } from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import {
  logVMDiskAttached,
  logVMDiskHotplug,
} from '@kubevirt-utils/extensions/telemetry/vm-storage';
import { UploadDataProps } from '@kubevirt-utils/hooks/useCDIUpload/types';
import { getVmDiskUploadSuccessLinks } from '@kubevirt-utils/hooks/useUploadProgressToast/utils/uploadLinks';
import { PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
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

import { reorderBootDisk } from './bootDiskUtils';
import { DEFAULT_CDROM_DISK_SIZE, DEFAULT_DISK_SIZE, UPLOAD_SUFFIX } from './constants';
import {
  createDataVolumeName,
  getEmptyVMDataVolumeResource,
  hotplugPromise,
  produceVMDisks,
} from './helpers';
import { SubmitInput, UploadDataVolumeOptions, V1DiskFormState } from './types';

export const uploadDataVolume = async (
  vm: V1VirtualMachine,
  uploadData: ({ dataVolume, file }: UploadDataProps) => Promise<void>,
  data: V1DiskFormState,
  dvName?: string,
  uploadKey?: string,
  t?: TFunction,
  options?: UploadDataVolumeOptions,
): Promise<V1beta1DataVolume> => {
  const { abortTooltip, onCancelCleanup } = options ?? {};
  const dataVolume = getEmptyVMDataVolumeResource(vm);
  const file = data?.uploadFile?.file;

  dataVolume.metadata.name = dvName || generateUploadDiskName(data.disk.name, UPLOAD_SUFFIX);
  dataVolume.spec.source = { upload: {} };
  const isCDROM = Boolean(data.disk?.cdrom);
  const defaultSize = isCDROM ? DEFAULT_CDROM_DISK_SIZE : DEFAULT_DISK_SIZE;
  dataVolume.spec.storage.resources.requests.storage =
    getDataVolumeTemplateSize(data) || defaultSize;

  await uploadData({
    dataVolume,
    file,
    uploadKey,
    uploadTrackMetadata:
      uploadKey && file
        ? {
            abortTooltip,
            contextLinks: t
              ? getVmDiskUploadSuccessLinks(
                  t,
                  vm,
                  data.disk?.name,
                  dataVolume.metadata.name,
                  isCDROM,
                )
              : undefined,
            dvCluster: getCluster(vm),
            dvName: dataVolume.metadata.name,
            dvNamespace: getNamespace(dataVolume),
            onCancelCleanup,
            resourceName: data.disk?.name,
          }
        : undefined,
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

export const resizeVMDataVolumeTemplate = (data: V1DiskFormState, vm: V1VirtualMachine) => {
  return produce(vm, (draftVM) => {
    if (!draftVM?.spec?.dataVolumeTemplates) return;

    const vmDataVolumeTemplate = draftVM.spec.dataVolumeTemplates.find(
      (dv) => getName(dv) === getName(data.dataVolumeTemplate),
    );
    ensurePath(vmDataVolumeTemplate, ['spec.storage.resources.requests.storage']);
    vmDataVolumeTemplate.spec.storage.resources.requests.storage = data.expandPVCSize;
  });
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

  const updateDisk = async (vmToSubmit: V1VirtualMachine) => {
    if (shouldHotplug) {
      try {
        const result = await hotplugPromise(vmToSubmit, data);
        logVMDiskHotplug(TELEMETRY_HOTPLUG_OPERATION.ADD);
        return result;
      } catch (error) {
        logVMDiskHotplug(TELEMETRY_HOTPLUG_OPERATION.ADD, error);
        throw error;
      }
    }

    const result = await onSubmit(vmToSubmit, data);
    logVMDiskAttached();
    return result;
  };

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

    if (data.dataVolumeTemplate) {
      return updateDisk(resizeVMDataVolumeTemplate(data, newVM));
    }
  }

  return updateDisk(newVM);
};
