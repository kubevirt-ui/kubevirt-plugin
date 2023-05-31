import {
  DEFAULT_INSTANCETYPE_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@catalog/CreateFromInstanceTypes/utils/constants';
import { BootableVolume } from '@catalog/CreateFromInstanceTypes/utils/types';
import { isBootableVolumePVCKind } from '@catalog/CreateFromInstanceTypes/utils/utils';
import { PersistentVolumeClaimModel } from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ANNOTATIONS, OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { BootableResource, BootableVolumeMetadata } from './types';

export const getSourcePreferenceLabelValue = (obj: BootableVolume): string =>
  obj?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL] || '';

export const getPreferenceReadableOS = (
  obj: BootableVolume,
  preferences: V1alpha2VirtualMachineClusterPreference[],
): string => {
  const preferenceLabelValue = getSourcePreferenceLabelValue(obj); // preference name
  const preferenceObject = preferences?.find(
    (preference) => preference?.metadata?.name === preferenceLabelValue,
  );

  return preferenceObject?.metadata?.annotations?.[ANNOTATIONS.displayName] || NO_DATA_DASH;
};

export const getPreferenceOSType = (obj: BootableVolume): OS_NAME_TYPES => {
  const preferenceLabelValue = getSourcePreferenceLabelValue(obj);

  return (
    Object.values(OS_NAME_TYPES).find((osName) => preferenceLabelValue?.includes(osName)) ??
    OS_NAME_TYPES.other
  );
};

export const deleteBootableVolumeMetadata = (obj: BootableResource) => {
  // labels object without default preference and instancetype labels
  const originalLabelsObject = Object.keys(obj?.metadata?.labels)
    .filter((key) => ![DEFAULT_PREFERENCE_LABEL, DEFAULT_INSTANCETYPE_LABEL].includes(key))
    .reduce((acc, key) => {
      return Object.assign(acc, {
        [key]: obj?.metadata?.labels?.[key],
      });
    }, {});

  const annotationsWithoutDescription = Object.keys(obj?.metadata?.annotations || {})
    .filter((key) => key !== 'description')
    .reduce((acc, key) => {
      return Object.assign(acc, {
        [key]: obj?.metadata?.annotations?.[key],
      });
    }, {});

  return async () => {
    await k8sPatch({
      model: isBootableVolumePVCKind(obj) ? PersistentVolumeClaimModel : DataSourceModel,
      resource: obj,
      data: [
        {
          op: 'replace',
          path: '/metadata/labels',
          value: originalLabelsObject,
        },
        {
          op: 'replace',
          path: '/metadata/annotations',
          value: annotationsWithoutDescription,
        },
      ],
    });
  };
};

export const changeBootableVolumeMetadata =
  (obj: BootableResource, metadata: BootableVolumeMetadata) => async () => {
    const initialMetadata = {
      labels: obj?.metadata?.labels,
      annotations: obj?.metadata?.annotations,
    };

    initialMetadata !== metadata &&
      (await k8sPatch({
        model: isBootableVolumePVCKind(obj) ? PersistentVolumeClaimModel : DataSourceModel,
        resource: obj,
        data: [
          {
            op: 'replace',
            path: '/metadata/labels',
            value: metadata.labels,
          },
          {
            op: 'replace',
            path: '/metadata/annotations',
            value: metadata.annotations,
          },
        ],
      }));
  };
