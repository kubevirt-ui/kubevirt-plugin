import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import {
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
import { ClaimPropertySets } from '@kubevirt-utils/types/storage';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';

export const createBootableVolumeFromDisk = async (
  diskObj: DiskRowDataLayout,
  vm: V1VirtualMachine,
  bootableVolumeSource: AddBootableVolumeState,
  applyStorageProfileSettings: boolean,
  claimPropertySets: ClaimPropertySets,
) => {
  const dataSource = produce(emptyDataSource, (draftDataSource) => {
    draftDataSource.metadata.name = bootableVolumeSource.bootableVolumeName;
    draftDataSource.metadata.namespace = bootableVolumeSource.bootableVolumeNamespace;

    draftDataSource.metadata.labels = {
      [DEFAULT_PREFERENCE_LABEL]: getPreferenceMatcher(vm)?.name,
      ...(bootableVolumeSource.labels || {}),
    };
  });

  return createPVCBootableVolume(
    bootableVolumeSource,
    diskObj?.namespace,
    applyStorageProfileSettings,
    claimPropertySets,
    dataSource,
  );
};

const addDiskToVM = (draftVM: WritableDraft<V1VirtualMachine>, diskToPersist: V1Disk) => {
  const disks = getDisks(draftVM) || [];

  if (isEmpty(diskToPersist) || disks.find((disk) => disk.name === diskToPersist.name)) return;

  disks.push({ ...diskToPersist, serial: null });

  draftVM.spec.template.spec.domain.devices.disks = disks;
};

const addDataVolumeToVM = (draftVM: WritableDraft<V1VirtualMachine>, dataVolumeName: string) => {
  const dataVolumeTemplates = getDataVolumeTemplates(draftVM);

  if (dataVolumeTemplates.find((dataVolume) => dataVolume.metadata.name === dataVolumeName)) return;

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
  produce(vm, (draftVM) => {
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
      addDataVolumeToVM(draftVM, volumeToPersist?.dataVolume?.name);

    return draftVM;
  });
