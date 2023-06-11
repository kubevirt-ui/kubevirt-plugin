import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel, {
  DataSourceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { BootableVolume } from './types';

export const isBootableVolumePVCKind = (bootableVolume: BootableVolume): boolean =>
  bootableVolume?.kind !== DataSourceModel.kind;

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
