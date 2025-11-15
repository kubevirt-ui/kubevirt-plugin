import { useMemo } from 'react';
import { isDataSourceReady } from 'src/views/datasources/utils';

import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import useListMulticlusterFilters from '@kubevirt-utils/hooks/useListMulticlusterFilters';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { convertResourceArrayToMapWithCluster } from '@kubevirt-utils/resources/shared';
import { isDataSourceCloning } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useFleetSearchPoll } from '@stolostron/multicluster-sdk';

const useMulticlusterAvailableSources = () => {
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
      error: dataSourcesError || pvcsError,
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
