import { useMemo } from 'react';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-utils/models';
import { getCluster } from '@multicluster/helpers/selectors';
import useIsACMPage from '@multicluster/useIsACMPage';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import useKubevirtSearchPoll from './useKubevirtSearchPoll';

export type UseMulticlusterNamespacesReturn = {
  allNamespaces: K8sResourceCommon[];
  error: Error | undefined;
  loaded: boolean;
  namespacesByCluster: Record<string, K8sResourceCommon[]>;
};

const useMulticlusterNamespaces = (
  selectedClusters?: string[],
): UseMulticlusterNamespacesReturn => {
  const isACMTreeView = useIsACMPage();

  const [namespaces, namespacesLoaded, namespacesError] = useKubevirtSearchPoll<
    K8sResourceCommon[]
  >(
    isACMTreeView
      ? {
          groupVersionKind: modelToGroupVersionKind(NamespaceModel),
          isList: true,
        }
      : {},
    selectedClusters ? [{ property: 'cluster', values: selectedClusters }] : undefined,
  );

  const namespacesByCluster = useMemo(
    () =>
      namespaces?.reduce<Record<string, K8sResourceCommon[]>>((acc, project) => {
        const cluster = getCluster(project);

        if (!cluster) return acc;

        if (!(cluster in acc)) acc[cluster] = [];

        acc[cluster].push(project);

        return acc;
      }, {}),
    [namespaces],
  );

  return useMemo(
    () => ({
      allNamespaces: namespaces,
      error: namespacesError,
      loaded: namespacesLoaded,
      namespacesByCluster,
    }),
    [namespaces, namespacesLoaded, namespacesError, namespacesByCluster],
  );
};

export default useMulticlusterNamespaces;
