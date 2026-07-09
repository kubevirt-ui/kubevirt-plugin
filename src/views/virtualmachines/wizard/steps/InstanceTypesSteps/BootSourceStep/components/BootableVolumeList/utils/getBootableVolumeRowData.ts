import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import {
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getBootableVolumePVCSource,
  getDataImportCronFromDataSource,
  getDataVolumeForPVC,
  getPreference,
} from '@kubevirt-utils/resources/bootableresources/helpers';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getName, NamespacedResourceMap, ResourceMap } from '@kubevirt-utils/resources/shared';
import { UseBootableVolumesValues } from '@virtualmachines/wizard/utils/types';

import { BootableVolumeRowData } from '../../../types';

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

  return {
    dataImportCron: getDataImportCronFromDataSource(
      dataImportCrons,
      bootableVolume as V1beta1DataSource,
    ),
    dvSource: getDataVolumeForPVC(pvcSource, dvSources),
    preference: getPreference(bootableVolume, preferencesMap, userPreferencesMap),
    pvcSource,
    volumeListNamespace,
    volumeSnapshotSource: volumeSnapshotSources?.[bootSourceName],
  };
};
