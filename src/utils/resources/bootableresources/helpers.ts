import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel, {
  DataSourceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import {
  V1beta1DataSource,
  V1beta1DataVolume,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { k8sDelete } from '@openshift-console/dynamic-plugin-sdk';

import { getLabel } from '../shared';

import { KUBEVIRT_ISO_LABEL } from './constants';
import { BootableVolume } from './types';

export const isBootableVolumePVCKind = (bootableVolume: BootableVolume): boolean =>
  bootableVolume?.kind === PersistentVolumeClaimModel.kind;

export const getBootableVolumeGroupVersionKind = (bootableVolume: BootableVolume) =>
  isBootableVolumePVCKind(bootableVolume)
    ? modelToGroupVersionKind(PersistentVolumeClaimModel)
    : DataSourceModelGroupVersionKind;

export const getBootableVolumePVCSource = (
  bootableVolume: BootableVolume,
  pvcSources: {
    [resourceKeyName: string]: IoK8sApiCoreV1PersistentVolumeClaim;
  },
): IoK8sApiCoreV1PersistentVolumeClaim | null => {
  if (isEmpty(bootableVolume)) return null;

  return isBootableVolumePVCKind(bootableVolume)
    ? bootableVolume
    : pvcSources?.[(bootableVolume as V1beta1DataSource)?.spec?.source?.pvc?.namespace]?.[
        (bootableVolume as V1beta1DataSource)?.spec?.source?.pvc?.name
      ];
};

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
