import produce from 'immer';

import type { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { createPVCBootableVolume } from '@kubevirt-utils/components/AddBootableVolumeModal/bootableVolumeSources';
import { emptyDataSource } from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import type { AddBootableVolumeState } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import { DEFAULT_PREFERENCE_LABEL } from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { getPreferenceMatcher } from '@kubevirt-utils/resources/vm';
import type { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { ARCHITECTURE_LABEL } from '@kubevirt-utils/utils/architecture';
import { isEmpty } from '@kubevirt-utils/utils/utils';

const getBootableVolumeDraft = (
  diskObj: DiskRowDataLayout,
  vm: V1VirtualMachine,
  bootableVolumeSource: AddBootableVolumeState,
  architecture?: string,
): Promise<V1beta1DataSource> => {
  const hasSelectedArchitecture = !isEmpty(architecture);
  const { bootableVolumeName, bootableVolumeNamespace, labels } = bootableVolumeSource ?? {};
  const dataSource = produce(emptyDataSource, (draftDataSource) => {
    draftDataSource.metadata.name = hasSelectedArchitecture
      ? `${bootableVolumeName}-${architecture}`
      : bootableVolumeName;
    draftDataSource.metadata.namespace = bootableVolumeNamespace;

    draftDataSource.metadata.labels = {
      [DEFAULT_PREFERENCE_LABEL]: getPreferenceMatcher(vm)?.name,
      ...(hasSelectedArchitecture ? { [ARCHITECTURE_LABEL]: architecture } : {}),
      ...(labels ?? {}),
    };
  });

  return createPVCBootableVolume(bootableVolumeSource, diskObj?.namespace, dataSource);
};

export const createBootableVolumeFromDisk = async (
  diskObj: DiskRowDataLayout,
  vm: V1VirtualMachine,
  bootableVolumeSource: AddBootableVolumeState,
): Promise<V1beta1DataSource> => {
  const architectures = bootableVolumeSource?.architectures;
  if (isEmpty(architectures)) {
    return getBootableVolumeDraft(diskObj, vm, bootableVolumeSource);
  }

  const bootableVolumes = await Promise.all(
    architectures.map((architecture) =>
      getBootableVolumeDraft(diskObj, vm, bootableVolumeSource, architecture),
    ),
  );

  // return the first bootable volume to navigate to (arbitrarily chosen)
  return bootableVolumes?.[0];
};
