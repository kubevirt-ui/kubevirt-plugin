import { DEFAULT_INSTANCETYPE_KIND_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import {
  DEFAULT_PREFERENCE_KIND_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@catalog/CreateFromInstanceTypes/utils/constants';
import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel, {
  DataSourceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import VirtualMachineInstancetypeModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstancetypeModel';
import VirtualMachinePreferenceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachinePreferenceModel';
import {
  V1beta1DataImportCron,
  V1beta1DataSource,
  V1beta1DataVolume,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachinePreference,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  getDataSourcePVCName,
  getDataSourcePVCNamespace,
} from '@kubevirt-utils/resources/bootableresources/selectors';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sDelete } from '@multicluster/k8sRequests';

import { SINGLE_CLUSTER_KEY } from '../constants';
import { VirtualMachinePreference } from '../preference/types';
import {
  ClusterNamespacedResourceMap,
  getLabel,
  getName,
  getNamespace,
  NamespacedResourceMap,
  ResourceMap,
} from '../shared';

import { deprecatedOSNames, KUBEVIRT_ISO_LABEL } from './constants';
import { BootableVolume } from './types';

export const isBootableVolumePVCKind = (
  bootableVolume: BootableVolume,
): bootableVolume is IoK8sApiCoreV1PersistentVolumeClaim =>
  bootableVolume?.kind === PersistentVolumeClaimModel.kind;

export const getBootableVolumeGroupVersionKind = (bootableVolume: BootableVolume) =>
  isBootableVolumePVCKind(bootableVolume)
    ? modelToGroupVersionKind(PersistentVolumeClaimModel)
    : DataSourceModelGroupVersionKind;

export const getBootableVolumePVCSource = (
  bootableVolume: BootableVolume,
  pvcSources: ClusterNamespacedResourceMap<IoK8sApiCoreV1PersistentVolumeClaim>,
): IoK8sApiCoreV1PersistentVolumeClaim | null => {
  if (isEmpty(bootableVolume)) return null;

  return isBootableVolumePVCKind(bootableVolume)
    ? bootableVolume
    : pvcSources?.[getCluster(bootableVolume) || SINGLE_CLUSTER_KEY]?.[
        getDataSourcePVCNamespace(bootableVolume as V1beta1DataSource)
      ]?.[getDataSourcePVCName(bootableVolume as V1beta1DataSource)];
};

export const getDataVolumeForPVC = (
  pvc: IoK8sApiCoreV1PersistentVolumeClaim,
  dvSources: ClusterNamespacedResourceMap<V1beta1DataVolume>,
) =>
  pvc
    ? dvSources?.[getCluster(pvc) || SINGLE_CLUSTER_KEY]?.[getNamespace(pvc)]?.[getName(pvc)]
    : null;

export const getInstanceTypePrefix = (instanceTypeNamePrefix: string): string => {
  if (instanceTypeNamePrefix?.includes('.')) {
    return instanceTypeNamePrefix?.split('.')?.[0];
  }
  return instanceTypeNamePrefix;
};

export const deleteDVAndRelatedResources = async (
  dataVolume: BootableVolume | V1beta1DataVolume,
  dataSource: BootableVolume | V1beta1DataSource,
  persistentVolumeClaim: BootableVolume | IoK8sApiCoreV1PersistentVolumeClaim,
): Promise<void> => {
  // We try to delete the created DV, if already GC, we want to fallback to delete the PVC
  try {
    await kubevirtK8sDelete({ model: DataVolumeModel, resource: dataVolume });
  } catch {
    await kubevirtK8sDelete({ model: PersistentVolumeClaimModel, resource: persistentVolumeClaim });
  }

  // A PVC not found error will be thrown if the DV and DS are in the same try block
  try {
    await kubevirtK8sDelete({ model: DataSourceModel, resource: dataSource });
  } catch (error) {
    kubevirtConsole.log(error);
  }
};

export const isBootableVolumeISO = (bootableVolume: BootableVolume): boolean =>
  getLabel(bootableVolume, KUBEVIRT_ISO_LABEL) === 'true';

export const isDeprecated = (bootVolumeName: string) => deprecatedOSNames.includes(bootVolumeName);

export const getDataImportCronFromDataSource = (
  dataImportCrons: V1beta1DataImportCron[],
  dataSource: V1beta1DataSource,
): V1beta1DataImportCron =>
  dataImportCrons?.find(
    (cron) =>
      cron?.spec?.managedDataSource === getName(dataSource) &&
      getNamespace(dataSource) === getNamespace(cron) &&
      getCluster(dataSource) === getCluster(cron),
  );

export const hasUserPreference = (bootableVolume: BootableVolume) =>
  getLabel(bootableVolume, DEFAULT_PREFERENCE_KIND_LABEL) === VirtualMachinePreferenceModel.kind;

export const hasUserInstanceType = (bootableVolume: BootableVolume) =>
  getLabel(bootableVolume, DEFAULT_INSTANCETYPE_KIND_LABEL) ===
  VirtualMachineInstancetypeModel.kind;

export const getPreference = (
  bootableVolume: BootableVolume,
  preferencesMap: ResourceMap<V1beta1VirtualMachineClusterPreference>,
  userPreferencesMap: NamespacedResourceMap<V1beta1VirtualMachinePreference>,
): VirtualMachinePreference => {
  const preferenceName = getLabel(bootableVolume, DEFAULT_PREFERENCE_LABEL);

  return hasUserPreference(bootableVolume)
    ? userPreferencesMap[getNamespace(bootableVolume)]?.[preferenceName]
    : preferencesMap[preferenceName];
};
