import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import {
  type V1beta1VirtualMachineClusterPreference,
  type V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getBootableVolumePVCSource,
  getDataImportCronFromDataSource,
  getPreference,
} from '@kubevirt-utils/resources/bootableresources/helpers';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import {
  getClusterKey,
  getName,
  getNamespace,
  type NamespacedResourceMap,
  type ResourceMap,
} from '@kubevirt-utils/resources/shared';
import { type UseBootableVolumesValues } from '@virtualmachines/wizard/utils/types';

import { type BootableVolumeRowData } from '../types';

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
  const pvcNamespace = pvcSource ? getNamespace(pvcSource) : undefined;
  const pvcName = pvcSource ? getName(pvcSource) : undefined;

  return {
    dataImportCron: getDataImportCronFromDataSource(
      dataImportCrons,
      bootableVolume as V1beta1DataSource,
    ),
    dvSource:
      pvcSource && pvcNamespace && pvcName
        ? dvSources?.[getClusterKey(pvcSource)]?.[pvcNamespace]?.[pvcName]
        : null,
    preference: getPreference(bootableVolume, preferencesMap, userPreferencesMap),
    pvcSource,
    volumeListNamespace,
    volumeSnapshotSource: bootSourceName ? volumeSnapshotSources?.[bootSourceName] : undefined,
  };
};
