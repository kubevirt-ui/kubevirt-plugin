import { useMemo } from 'react';
import { isDataSourceReady } from 'src/views/datasources/utils';

import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import useListMulticlusterFilters from '@kubevirt-utils/hooks/useListMulticlusterFilters';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import {
  type ClusterNamespacedResourceMap,
  convertResourceArrayToMapWithCluster,
} from '@kubevirt-utils/resources/shared';
import { isDataSourceCloning } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useFleetSearchPoll } from '@stolostron/multicluster-sdk';

type UseMulticlusterAvailableSourcesReturn = {
  availableDataSources: ClusterNamespacedResourceMap<V1beta1DataSource>;
  availablePVCs: ClusterNamespacedResourceMap<IoK8sApiCoreV1PersistentVolumeClaim>;
  cloneInProgressDataSources: ClusterNamespacedResourceMap<V1beta1DataSource>;
  error: Error | undefined;
  loaded: boolean;
};

const useMulticlusterAvailableSources = (): UseMulticlusterAvailableSourcesReturn => {
  const multiclusterSearch = useListMulticlusterFilters();
  const isACMPage = useIsACMPage();

  const [dataSources, dataSourcesLoaded, dataSourcesError] = useFleetSearchPoll<
    V1beta1DataSource[]
  >(
    isACMPage
      ? {
          groupVersionKind: modelToGroupVersionKind(DataSourceModel),
          isList: true,
        }
      : {},
    multiclusterSearch,
  );

  const [pvcs, pvcsLoaded, pvcsError] = useFleetSearchPoll<IoK8sApiCoreV1PersistentVolumeClaim[]>(
    isACMPage
      ? {
          groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
          isList: true,
        }
      : {},
    multiclusterSearch,
  );

  const availableDataSources = useMemo(
    () => convertResourceArrayToMapWithCluster(dataSources?.filter(isDataSourceReady), true),
    [dataSources],
  );

  const cloneInProgressDataSources = useMemo(
    () => convertResourceArrayToMapWithCluster(dataSources?.filter(isDataSourceCloning), true),
    [dataSources],
  );

  const pvcsMap = useMemo(() => convertResourceArrayToMapWithCluster(pvcs, true), [pvcs]);

  return useMemo(
    () => ({
      availableDataSources,
      availablePVCs: pvcsMap,
      cloneInProgressDataSources,
      error: (dataSourcesError ?? pvcsError) as Error | undefined,
      loaded: pvcsLoaded && dataSourcesLoaded,
    }),
    [
      dataSourcesError,
      dataSourcesLoaded,
      cloneInProgressDataSources,
      availableDataSources,
      pvcsError,
      pvcsLoaded,
      pvcsMap,
    ],
  );
};

export default useMulticlusterAvailableSources;
