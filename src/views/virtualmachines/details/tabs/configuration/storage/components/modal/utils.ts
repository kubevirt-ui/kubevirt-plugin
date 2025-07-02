import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  V1beta1StorageSpec,
  V1Disk,
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  AddBootableVolumeState,
  emptyDataSource,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import { createPVCBootableVolume } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/utils';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import {
  getDataVolumeTemplates,
  getDisks,
  getPreferenceMatcher,
  getVolumes,
} from '@kubevirt-utils/resources/vm';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { getVMIDevices } from '@kubevirt-utils/resources/vmi';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';

export const createBootableVolumeFromDisk = async (
  diskObj: DiskRowDataLayout,
  vm: V1VirtualMachine,
  bootableVolumeSource: AddBootableVolumeState,
) => {
  const dataSource = produce(emptyDataSource, (draftDataSource) => {
    draftDataSource.metadata.name = bootableVolumeSource.bootableVolumeName;
    draftDataSource.metadata.namespace = bootableVolumeSource.bootableVolumeNamespace;

    draftDataSource.metadata.labels = {
      [DEFAULT_PREFERENCE_LABEL]: getPreferenceMatcher(vm)?.name,
      ...(bootableVolumeSource.labels || {}),
    };
  });

  return createPVCBootableVolume(bootableVolumeSource, diskObj?.namespace, dataSource);
};

const addDiskToVM = (draftVM: WritableDraft<V1VirtualMachine>, diskToPersist: V1Disk) => {
  const disks = getDisks(draftVM) || [];

  if (isEmpty(diskToPersist) || disks.find((disk) => disk.name === diskToPersist.name)) return;

  disks.push({ ...diskToPersist, serial: null });

  draftVM.spec.template.spec.domain.devices.disks = disks;
};

const addDataVolumeToVM = async (
  draftVM: WritableDraft<V1VirtualMachine>,
  dataVolumeName: string,
) => {
  const dataVolumeTemplates = getDataVolumeTemplates(draftVM);

  if (dataVolumeTemplates.find((dataVolume) => dataVolume.metadata.name === dataVolumeName)) return;

  const originDataVolume = await k8sGet<V1beta1DataVolume>({
    model: DataVolumeModel,
    name: dataVolumeName,
    ns: getNamespace(draftVM),
  });

  dataVolumeTemplates.push({
    metadata: {
      name: dataVolumeName,
    },
    spec: {
      source: {
        pvc: {
          name: dataVolumeName,
          namespace: getNamespace(draftVM),
        },
      },
      storage: originDataVolume?.spec?.storage as V1beta1StorageSpec,
    },
  });
};

const removeHotplugFromVolume = (volume: V1Volume) =>
  produce(volume, (draftVolume) => {
    if (draftVolume?.dataVolume?.hotpluggable) delete draftVolume.dataVolume.hotpluggable;

    if (draftVolume?.persistentVolumeClaim?.hotpluggable)
      delete draftVolume.persistentVolumeClaim.hotpluggable;
  });

export const persistVolume = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  volumeToPersist: V1Volume,
) =>
  produce(vm, async (draftVM) => {
    ensurePath(draftVM, 'spec.template.spec.domain.devices');

    const vmVolumes = getVolumes(draftVM);

    const vmVolumeToPersist = vmVolumes.find((vmVolume) => vmVolume.name === volumeToPersist?.name);

    if (vmVolumeToPersist) {
      draftVM.spec.template.spec.volumes = [
        ...vmVolumes.filter((volume) => volume.name !== vmVolumeToPersist.name),
        removeHotplugFromVolume(vmVolumeToPersist),
      ];
    }

    if (!vmVolumeToPersist) {
      vmVolumes.push(removeHotplugFromVolume(volumeToPersist));
    }

    const diskToPersist = getVMIDevices(vmi)?.disks?.find(
      (disk) => disk.name === volumeToPersist.name,
    );

    addDiskToVM(draftVM, diskToPersist);

    if (!isEmpty(volumeToPersist?.dataVolume?.name))
      await addDataVolumeToVM(draftVM, volumeToPersist?.dataVolume?.name);

    return draftVM;
  });
