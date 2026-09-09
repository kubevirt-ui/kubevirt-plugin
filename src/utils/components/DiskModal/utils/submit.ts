import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { TELEMETRY_HOTPLUG_OPERATION } from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import {
  logVMDiskAttached,
  logVMDiskHotplug,
} from '@kubevirt-utils/extensions/telemetry/vm-storage';
import { PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { getBootDisk } from '@kubevirt-utils/resources/vm';
import { ensurePath, generateUploadDiskName, isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { isRunning } from '@virtualmachines/utils';

import { getDataVolumeTemplateSize } from '../components/utils/selectors';
import { reorderBootDisk } from './bootDiskUtils';
import { DEFAULT_CDROM_DISK_SIZE, DEFAULT_DISK_SIZE, UPLOAD_SUFFIX } from './constants';
import {
  buildUploadTrackMetadata,
  createDataVolumeName,
  getEmptyVMDataVolumeResource,
  hotplugPromise,
} from './helpers';
import { addDisk, editDisk, resizeVMDataVolumeTemplate } from './submitDiskMutations';
import { type SubmitInput, type UploadDataVolumeParams } from './types';

export { addDisk, editDisk, resizeVMDataVolumeTemplate } from './submitDiskMutations';

export const uploadDataVolume = async ({
  data,
  dvName,
  options,
  t,
  uploadData,
  uploadKey,
  vm,
}: UploadDataVolumeParams): Promise<V1beta1DataVolume> => {
  const { abortTooltip, onCancelCleanup } = options ?? {};
  const dataVolume = getEmptyVMDataVolumeResource(vm);
  const file = data?.uploadFile?.file;

  dataVolume.metadata.name = dvName ?? generateUploadDiskName(data.disk.name, UPLOAD_SUFFIX);
  dataVolume.spec.source = { upload: {} };
  const isCDROM = Boolean(data.disk?.cdrom);
  const defaultSize = isCDROM ? DEFAULT_CDROM_DISK_SIZE : DEFAULT_DISK_SIZE;
  dataVolume.spec.storage.resources.requests.storage =
    getDataVolumeTemplateSize(data) ?? defaultSize;

  await uploadData({
    dataVolume,
    file,
    uploadKey,
    uploadTrackMetadata: buildUploadTrackMetadata({
      abortTooltip,
      data,
      dataVolume,
      file,
      isCDROM,
      onCancelCleanup,
      t,
      uploadKey,
      vm,
    }),
  });

  if (data?.dataVolumeTemplate?.spec?.source?.upload) {
    delete data.dataVolumeTemplate.spec.source.upload;
  }

  return dataVolume;
};

export const submit = async ({
  data,
  editDiskName,
  isHotpluggable = false,
  onSubmit,
  pvc,
  vm,
}: SubmitInput): Promise<string | V1VirtualMachine | void> => {
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

  const updateDisk = async (
    vmToSubmit: V1VirtualMachine,
  ): Promise<string | V1VirtualMachine | void> => {
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
