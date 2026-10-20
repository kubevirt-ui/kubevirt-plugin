import { useEffect, useMemo, useState } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { getName } from '@kubevirt-utils/resources/shared';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import useManagedClusterConsoleURLs from '@multicluster/hooks/useManagedClusterConsoleURLs';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

import {
  type AllowedNamespacesLoaderResult,
  loadAllowedNamespaces,
  peekAllowedNamespacesCache,
} from './allowedNamespacesLoader';

export type UseAllowedNamespacesResult = AllowedNamespacesLoaderResult;

const emptyResult: UseAllowedNamespacesResult = {
  allowedNamespaces: [],
  error: null,
  failures: [],
  filterByAllowedNamespaces: false,
  loaded: true,
};

const loadingResult: UseAllowedNamespacesResult = {
  allowedNamespaces: [],
  error: null,
  failures: [],
  filterByAllowedNamespaces: false,
  loaded: false,
};

const useAllowedNamespaces = (
  accessReview: FleetAccessReviewResourceAttributes | null,
): UseAllowedNamespacesResult => {
  const accessReviewMemoized = useDeepCompareMemoize<FleetAccessReviewResourceAttributes | null>(
    accessReview,
  );

  const cluster = accessReviewMemoized?.cluster;
  const { isSpokeCluster, loaded: managedClustersLoaded } = useManagedClusterConsoleURLs(cluster);

  const [projects, projectsLoaded] = useK8sWatchData<K8sResourceCommon[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
    namespaced: false,
  });

  const allNamespaceNames = useMemo(
    () =>
      (projects ?? [])
        .reduce<string[]>((acc, project) => {
          const name = getName(project);
          if (name) {
            acc.push(name);
          }
          return acc;
        }, [])
        .sort((a, b) => a.localeCompare(b)),
    [projects],
  );

  const [result, setResult] = useState<UseAllowedNamespacesResult>(emptyResult);

  useEffect(() => {
    if (!accessReviewMemoized) {
      setResult(emptyResult);
      return;
    }

    if (!projectsLoaded || !managedClustersLoaded) {
      setResult(loadingResult);
      return;
    }

    const cached = peekAllowedNamespacesCache(accessReviewMemoized, allNamespaceNames);
    if (cached) {
      setResult(cached);
      return;
    }

    setResult(loadingResult);

    let cancelled = false;

    void loadAllowedNamespaces({
      accessReview: accessReviewMemoized,
      allNamespaceNames,
      isSpokeCluster,
    }).then((loadedResult) => {
      if (!cancelled) {
        setResult(loadedResult);
      }
    });

    return (): void => {
      cancelled = true;
    };
  }, [
    accessReviewMemoized,
    allNamespaceNames,
    isSpokeCluster,
    managedClustersLoaded,
    projectsLoaded,
  ]);

  return result;
};

export default useAllowedNamespaces;
