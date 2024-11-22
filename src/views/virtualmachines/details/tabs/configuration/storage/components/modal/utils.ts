import produce from 'immer';

import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  AddBootableVolumeState,
  emptyDataSource,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import { createPVCBootableVolume } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/utils';
import { getDisks, getPreferenceMatcher } from '@kubevirt-utils/resources/vm';
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

export const persistVolume = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  volumeToPersist: V1Volume,
) =>
  produce(vm, (draftVM) => {
    ensurePath(draftVM, 'spec.template.spec.domain.devices');

    draftVM.spec.template.spec.volumes.push(volumeToPersist);

    const diskToPersist = getVMIDevices(vmi)?.disks?.find(
      (disk) => disk.name === volumeToPersist.name,
    );

    if (isEmpty(diskToPersist)) return;

    const disks = getDisks(draftVM) || [];

    disks.push({ ...diskToPersist, serial: null });

    draftVM.spec.template.spec.domain.devices.disks = disks;

    return draftVM;
  });
