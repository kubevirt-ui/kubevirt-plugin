import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import {
  type V1beta1VirtualMachineClusterPreference,
  type V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import {
  getBootableVolumePVCSource,
  getDataImportCronFromDataSource,
  getDataVolumeForPVC,
  getPreference,
} from '@kubevirt-utils/resources/bootableresources/helpers';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import {
  getName,
  type NamespacedResourceMap,
  type ResourceMap,
} from '@kubevirt-utils/resources/shared';
import { type UseBootableVolumesValues } from '@virtualmachines/wizard/utils/types';

import { type BootableVolumeRowData } from '../../../types';

type GetBootableVolumeRowDataArgs = {
  bootableVolume: BootableVolume;
  bootableVolumesData: UseBootableVolumesValues;
  preferencesMap: ResourceMap<V1beta1VirtualMachineClusterPreference>;
  userPreferencesMap: NamespacedResourceMap<V1beta1VirtualMachinePreference>;
  volumeListNamespace: string;
};

export const getBootableVolumeRowData = ({
  bootableVolume,
  bootableVolumesData,
  preferencesMap,
  userPreferencesMap,
  volumeListNamespace,
}: GetBootableVolumeRowDataArgs): BootableVolumeRowData => {
  const bootSourceName = getName(bootableVolume);
  const { dataImportCrons, dvSources, pvcSources, volumeSnapshotSources } = bootableVolumesData;
  const pvcSource = getBootableVolumePVCSource(bootableVolume, pvcSources);
  const volumeSnapshotSource: VolumeSnapshotKind | undefined = bootSourceName
    ? volumeSnapshotSources[bootSourceName]
    : undefined;

  return {
    dataImportCron: getDataImportCronFromDataSource(
      dataImportCrons,
      bootableVolume as V1beta1DataSource,
    ),
    dvSource: getDataVolumeForPVC(pvcSource, dvSources),
    preference: getPreference(bootableVolume, preferencesMap, userPreferencesMap),
    pvcSource,
    volumeListNamespace,
    volumeSnapshotSource,
  };
};
