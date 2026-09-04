import { useMemo } from 'react';

import { PersistentVolumeClaimModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  type ClusterNamespacedResourceMap,
  convertResourceArrayToMapWithCluster,
  getName,
  getNamespace,
} from '@kubevirt-utils/resources/shared';
import { BOOT_SOURCE, type Template } from '@kubevirt-utils/resources/template';
import {
  getTemplateBootSourceType,
  isDataSourceCloning,
  isDataSourceReady,
} from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import {
  getGroupVersionKindForModel,
  useK8sWatchResources,
  type WatchK8sResource,
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
export const useSingleClusterAvailableSources = (
  templates: Template[],
  templatesLoaded: boolean,
): {
  availableDataSources: Record<string, V1beta1DataSource>;
  availablePVCs: ClusterNamespacedResourceMap<IoK8sApiCoreV1PersistentVolumeClaim>;
  cloneInProgressDataSources: Record<string, V1beta1DataSource>;
  loaded: boolean;
} => {
  const { uniqueDataSources, uniquePVCs } = useMemo(() => {
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
          const sourceRef = bootSource?.source?.sourceRef;
          acc.uniqueDataSources[`${sourceRef?.namespace}-${sourceRef?.name}`] = {
            groupVersionKind: getGroupVersionKindForModel(DataSourceModel),
            isList: false,
            name: sourceRef?.name,
            namespace: sourceRef?.namespace,
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

  const { availableDataSources, cloneInProgressDataSources } = useMemo(
    () =>
      Object.values(watchDataSources).reduce<{
        availableDataSources: Record<string, V1beta1DataSource>;
        cloneInProgressDataSources: Record<string, V1beta1DataSource>;
      }>(
        (acc, { data: dataSource }) => {
          if (isDataSourceReady(dataSource as V1beta1DataSource)) {
            acc.availableDataSources[`${getNamespace(dataSource)}-${getName(dataSource)}`] =
              dataSource as V1beta1DataSource;
            return acc;
          }

          if (isDataSourceCloning(dataSource)) {
            acc.cloneInProgressDataSources[`${getNamespace(dataSource)}-${getName(dataSource)}`] =
              dataSource as V1beta1DataSource;
            return acc;
          }
          return acc;
        },
        { availableDataSources: {}, cloneInProgressDataSources: {} },
      ),
    [watchDataSources],
  );

  const availablePVCs = useMemo(
    () =>
      convertResourceArrayToMapWithCluster<IoK8sApiCoreV1PersistentVolumeClaim>(
        Object.values(watchPVCs).map(({ data: pvc }) => pvc),
        true,
      ),
    [watchPVCs],
  );

  return { availableDataSources, availablePVCs, cloneInProgressDataSources, loaded };
};
