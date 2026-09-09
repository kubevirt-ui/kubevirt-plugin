import { useMemo } from 'react';

import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  type ClusterNamespacedResourceMap,
  convertResourceArrayToMapWithCluster,
} from '@kubevirt-utils/resources/shared';
import { useSingleClusterAvailableSources } from '@kubevirt-utils/resources/template/hooks/useSingleClusterAvailableSources';
import useMulticlusterAvailableSources from '@multicluster/hooks/useMulticlusterAvailableSources';
import useIsACMPage from '@multicluster/useIsACMPage';

type AvailableSourcesResult = {
  availableDataSources:
    | ClusterNamespacedResourceMap<V1beta1DataSource>
    | Record<string, V1beta1DataSource>;
  availablePVCs: ClusterNamespacedResourceMap<IoK8sApiCoreV1PersistentVolumeClaim>;
  bootSourcesLoaded: boolean;
  cloneInProgressDataSources:
    | ClusterNamespacedResourceMap<V1beta1DataSource>
    | Record<string, V1beta1DataSource>;
};

const useAvailableSources = (
  templates: V1Template[],
  templatesLoaded: boolean,
): AvailableSourcesResult => {
  const isACMPage = useIsACMPage();

  const {
    availableDataSources: singleClusterAvailableDataSources,
    availablePVCs: singleClusterAvailablePVCs,
    cloneInProgressDataSources: singleClusterCloneInProgressDataSources,
    loaded: singleClusterBootSourcesLoaded,
  } = useSingleClusterAvailableSources(isACMPage ? [] : templates, templatesLoaded);

  const singleClusterAvailableDataSourcesMap = useMemo(
    () =>
      convertResourceArrayToMapWithCluster<V1beta1DataSource>(
        Object.values(singleClusterAvailableDataSources),
        true,
      ),
    [singleClusterAvailableDataSources],
  );
  const singleClusterCloneInProgressDataSourcesMap = useMemo(
    () =>
      convertResourceArrayToMapWithCluster<V1beta1DataSource>(
        Object.values(singleClusterCloneInProgressDataSources),
        true,
      ),
    [singleClusterCloneInProgressDataSources],
  );

  const {
    availableDataSources: multiclusterAvailableDataSources,
    availablePVCs: multiclusterAvailablePVCs,
    cloneInProgressDataSources: multiclusterCloneInProgressDataSources,
    loaded: multiclusterBootSourcesLoaded,
  } = useMulticlusterAvailableSources();

  const availableDataSources = isACMPage
    ? multiclusterAvailableDataSources
    : singleClusterAvailableDataSourcesMap;

  const availablePVCs = isACMPage ? multiclusterAvailablePVCs : singleClusterAvailablePVCs;

  const cloneInProgressDataSources = isACMPage
    ? multiclusterCloneInProgressDataSources
    : singleClusterCloneInProgressDataSourcesMap;

  const bootSourcesLoaded = isACMPage
    ? multiclusterBootSourcesLoaded
    : singleClusterBootSourcesLoaded;

  return { availableDataSources, availablePVCs, bootSourcesLoaded, cloneInProgressDataSources };
};

export default useAvailableSources;
