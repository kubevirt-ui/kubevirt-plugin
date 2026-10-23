import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { getName } from '@kubevirt-utils/resources/shared';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import useManagedClusterConsoleURLs from '@multicluster/hooks/useManagedClusterConsoleURLs';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

import { type UseAllowedNamespacesResult } from './types';
import useFetchAllowedNamespacesInFlight from './useFetchAllowedNamespacesInFlight';

export type { UseAllowedNamespacesResult };

const useAllowedNamespaces = (
  accessReview: FleetAccessReviewResourceAttributes | null,
  cluster?: string,
): UseAllowedNamespacesResult => {
  const accessReviewMemoized = useDeepCompareMemoize(accessReview);
  const watchCluster = accessReviewMemoized?.cluster ?? cluster;
  const { isSpokeCluster, loaded: managedClustersLoaded } = useManagedClusterConsoleURLs(
    accessReviewMemoized?.cluster,
  );

  const [namespaces, namespacesLoaded, namespacesWatchError] = useK8sWatchData<K8sResourceCommon[]>(
    {
      cluster: watchCluster,
      groupVersionKind: modelToGroupVersionKind(ProjectModel),
      isList: true,
      namespaced: false,
    },
  );

  const useAllowedNamespacesApi =
    Boolean(accessReviewMemoized) && managedClustersLoaded && !isSpokeCluster;
  const api = useFetchAllowedNamespacesInFlight(accessReviewMemoized, useAllowedNamespacesApi);

  const namespacesError = namespacesWatchError ?? (useAllowedNamespacesApi ? api.error : null);

  if (!useAllowedNamespacesApi || api.error) {
    return { namespaces, namespacesError, namespacesLoaded };
  }

  const allowedNamespaces = new Set(api.data?.allowedNamespaces ?? []);

  return {
    namespaces: (namespaces ?? []).filter((namespace) => allowedNamespaces.has(getName(namespace))),
    namespacesError,
    namespacesLoaded: api.loaded && namespacesLoaded,
  };
};

export default useAllowedNamespaces;
