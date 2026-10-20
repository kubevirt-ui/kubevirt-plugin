import { useEffect, useMemo, useState } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { getName } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import useManagedClusterConsoleURLs from '@multicluster/hooks/useManagedClusterConsoleURLs';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

import { fetchAllowedNamespaces } from './fetchAllowedNamespaces';
import { type AllowedNamespacesFailure } from './types';
import { toAllowedNamespacesRequestResourceAttributes } from './utils';

export type UseAllowedNamespacesResult = {
  allowedNamespaces: string[];
  error: Error | null;
  failures: AllowedNamespacesFailure[];
  /** When false, consumers should show every visible namespace (managed cluster or API fallback). */
  filterByAllowedNamespaces: boolean;
  loaded: boolean;
};

const emptyResult: UseAllowedNamespacesResult = {
  allowedNamespaces: [],
  error: null,
  failures: [],
  filterByAllowedNamespaces: false,
  loaded: true,
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
      setResult({
        allowedNamespaces: [],
        error: null,
        failures: [],
        filterByAllowedNamespaces: false,
        loaded: false,
      });
      return;
    }

    if (isSpokeCluster) {
      setResult({
        allowedNamespaces: allNamespaceNames,
        error: null,
        failures: [],
        filterByAllowedNamespaces: false,
        loaded: true,
      });
      return;
    }

    let cancelled = false;

    const loadAllowedNamespaces = async (): Promise<void> => {
      try {
        const response = await fetchAllowedNamespaces({
          resourceAttributes: toAllowedNamespacesRequestResourceAttributes(accessReviewMemoized),
        });

        if (cancelled) {
          return;
        }

        setResult({
          allowedNamespaces: response.allowedNamespaces ?? [],
          error: null,
          failures: response.failures ?? [],
          filterByAllowedNamespaces: true,
          loaded: true,
        });
      } catch (e) {
        if (cancelled) {
          return;
        }

        const resolvedError = e instanceof Error ? e : new Error(String(e));
        kubevirtConsole.warn('Failed to resolve allowed namespaces', resolvedError);
        setResult({
          allowedNamespaces: allNamespaceNames,
          error: resolvedError,
          failures: [],
          filterByAllowedNamespaces: false,
          loaded: true,
        });
      }
    };

    void loadAllowedNamespaces();

    return (): void => {
      cancelled = true;
    };
  }, [
    accessReviewMemoized,
    allNamespaceNames,
    cluster,
    isSpokeCluster,
    managedClustersLoaded,
    projectsLoaded,
  ]);

  return result;
};

export default useAllowedNamespaces;
