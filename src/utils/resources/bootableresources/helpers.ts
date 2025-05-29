import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel, {
  DataSourceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import {
  V1beta1DataImportCron,
  V1beta1DataSource,
  V1beta1DataVolume,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  getDataSourcePVCName,
  getDataSourcePVCNamespace,
} from '@kubevirt-utils/resources/bootableresources/selectors';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { k8sDelete } from '@openshift-console/dynamic-plugin-sdk';

import { getLabel, getName, getNamespace, NamespacedResourceMap } from '../shared';

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
  pvcSources: NamespacedResourceMap<IoK8sApiCoreV1PersistentVolumeClaim>,
): IoK8sApiCoreV1PersistentVolumeClaim | null => {
  if (isEmpty(bootableVolume)) return null;

  return isBootableVolumePVCKind(bootableVolume)
    ? bootableVolume
    : pvcSources?.[getDataSourcePVCNamespace(bootableVolume as V1beta1DataSource)]?.[
        getDataSourcePVCName(bootableVolume as V1beta1DataSource)
      ];
};

export const getDataVolumeForPVC = (
  pvc: IoK8sApiCoreV1PersistentVolumeClaim,
  dvSources: NamespacedResourceMap<V1beta1DataVolume>,
) => (pvc ? dvSources?.[getNamespace(pvc)]?.[getName(pvc)] : null);

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
    await k8sDelete({ model: DataVolumeModel, resource: dataVolume });
  } catch {
    await k8sDelete({ model: PersistentVolumeClaimModel, resource: persistentVolumeClaim });
  }

  // A PVC not found error will be thrown if the DV and DS are in the same try block
  try {
    await k8sDelete({ model: DataSourceModel, resource: dataSource });
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
      getNamespace(dataSource) === getNamespace(cron),
  );
