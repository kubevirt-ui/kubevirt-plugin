import produce from 'immer';

import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  AddBootableVolumeState,
  emptyDataSource,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import { createPVCBootableVolume } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/utils';
import { getPreferenceMatcher } from '@kubevirt-utils/resources/vm';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { ClaimPropertySets } from '@kubevirt-utils/types/storage';

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
