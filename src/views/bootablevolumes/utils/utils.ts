import { isDataSourceReady } from 'src/views/datasources/utils';

import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ANNOTATIONS, OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { k8sPatch, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { BootableVolumeMetadata } from './types';

export const getAvailableDataSources = (dataSources: V1beta1DataSource[]) =>
  dataSources.filter((dataSource) => isDataSourceReady(dataSource));

export const getDataSourcePreferenceLabelValue = (
  obj: V1beta1DataSource | K8sResourceCommon,
): string => obj?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL] || '';

export const getPreferenceReadableOS = (
  obj: V1beta1DataSource,
  preferences: V1alpha2VirtualMachineClusterPreference[],
): string => {
  const preferenceLabelValue = getDataSourcePreferenceLabelValue(obj); // preference name
  const preferenceObject = preferences?.find(
    (preference) => preference?.metadata?.name === preferenceLabelValue,
  );

  return preferenceObject?.metadata?.annotations?.[ANNOTATIONS.displayName];
};

export const getPreferenceOSType = (obj: V1beta1DataSource): OS_NAME_TYPES => {
  const preferenceLabelValue = getDataSourcePreferenceLabelValue(obj);

  return (
    Object.values(OS_NAME_TYPES).find((osName) => preferenceLabelValue?.includes(osName)) ??
    OS_NAME_TYPES.other
  );
};

export const deletePreferenceLabel = (obj: V1beta1DataSource) => {
  const labelsWithoutDefaultPreference = Object.keys(obj?.metadata?.labels)
    .filter((key) => key !== DEFAULT_PREFERENCE_LABEL)
    .reduce((acc, key) => {
      return Object.assign(acc, {
        [key]: obj?.metadata?.labels?.[key],
      });
    }, {});

  return async () => {
    await k8sPatch({
      model: DataSourceModel,
      resource: obj,
      data: [
        {
          op: 'replace',
          path: '/metadata/labels',
          value: labelsWithoutDefaultPreference,
        },
      ],
    });
  };
};

export const changeBootableVolumeMetadata =
  (
    obj: V1beta1DataSource,
    initialMetadata: BootableVolumeMetadata,
    metadata: BootableVolumeMetadata,
  ) =>
  async () => {
    initialMetadata !== metadata &&
      (await k8sPatch({
        model: DataSourceModel,
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
