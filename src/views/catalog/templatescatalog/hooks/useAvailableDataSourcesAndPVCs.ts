import React from 'react';

import { PersistentVolumeClaimModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { BOOT_SOURCE } from '@kubevirt-utils/resources/template';
import {
  getTemplateBootSourceType,
  isDataSourceCloning,
  isDataSourceReady,
} from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import {
  getGroupVersionKindForModel,
  useK8sWatchResources,
  WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';

type UniqueSourceType = {
  [key in string]: WatchK8sResource;
};

/**
 * Hook that returns the DataSources and PVCs that are available for the templates
 * @param templates - the templates to filter
 * @param templatesLoaded - whether the templates are loaded
 * @returns availablePVCs and availableDatasources, both Sets of strings representing the available sources. `{namespace-name}`
 */
export const useAvailableDataSourcesAndPVCs = (
  templates: V1Template[],
  templatesLoaded: boolean,
) => {
  const { uniqueDataSources, uniquePVCs } = React.useMemo(() => {
    if (!templatesLoaded)
      return {
        uniqueDataSources: {},
        uniquePVCs: {},
      };

    return templates.reduce<{
      uniqueDataSources: UniqueSourceType;
      uniquePVCs: UniqueSourceType;
    }>(
      (acc, template) => {
        const bootSource = getTemplateBootSourceType(template);

        if (bootSource.type === BOOT_SOURCE.DATA_SOURCE) {
          const ds = bootSource?.source?.sourceRef;
          acc.uniqueDataSources[`${ds?.namespace}-${ds?.name}`] = {
            groupVersionKind: getGroupVersionKindForModel(DataSourceModel),
            isList: false,
            name: ds?.name,
            namespace: ds?.namespace,
          };
        }

        if (bootSource.type === BOOT_SOURCE.PVC) {
          const pvc = bootSource?.source?.pvc;
          acc.uniquePVCs[`${pvc?.namespace}-${pvc?.name}`] = {
            groupVersionKind: getGroupVersionKindForModel(PersistentVolumeClaimModel),
            isList: false,
            name: pvc?.name,
            namespace: pvc?.namespace,
          };
        }

        return acc;
      },
      { uniqueDataSources: {}, uniquePVCs: {} },
    );
  }, [templates, templatesLoaded]);

  const watchDataSources = useK8sWatchResources<{
    [key in string]: V1beta1DataSource;
  }>(uniqueDataSources);

  const watchPVCs = useK8sWatchResources<{
    [key in string]: IoK8sApiCoreV1PersistentVolumeClaim;
  }>(uniquePVCs);

  const loaded = Object.values({ ...watchDataSources, ...watchPVCs }).every(
    (watchResource) => watchResource.loaded || watchResource.loadError,
  );

  const { availableDatasources, cloneInProgressDatasources } = Object.values(
    watchDataSources,
  ).reduce(
    (acc, { data: dataSource }) => {
      if (isDataSourceReady(dataSource as V1beta1DataSource)) {
        acc.availableDatasources[
          `${dataSource?.metadata?.namespace}-${dataSource?.metadata?.name}`
        ] = dataSource;
        return acc;
      }

      if (isDataSourceCloning(dataSource)) {
        acc.cloneInProgressDatasources[
          `${dataSource?.metadata?.namespace}-${dataSource?.metadata?.name}`
        ] = dataSource;
        return acc;
      }
      return acc;
    },
    { availableDatasources: {}, cloneInProgressDatasources: {} },
  );

  const availablePVCs = new Set(
    Object.values(watchPVCs).map(
      ({ data: pvc }) => `${pvc?.metadata?.namespace}-${pvc?.metadata?.name}`,
    ),
  );

  return { availableDatasources, availablePVCs, cloneInProgressDatasources, loaded };
};
