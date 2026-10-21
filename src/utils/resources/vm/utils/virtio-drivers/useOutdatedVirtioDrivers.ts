import { useMemo } from 'react';

import { ALL_CLUSTERS_KEY } from '@kubevirt-utils/hooks/constants';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { usePrometheusAvailability } from '@kubevirt-utils/hooks/usePrometheusAvailability';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetPrometheusPoll } from '@stolostron/multicluster-sdk';

import { buildOutdatedVirtioDriversQuery } from './queries';
import { parseOutdatedVirtioVmKeys } from './utils';

type UseOutdatedVirtioDriversOptions = {
  /** When set, scopes the query to a single VM name. */
  name?: string;
  /** Overrides the active namespace for the query. */
  namespace?: string;
};

type UseOutdatedVirtioDriversResult = {
  error: Error | unknown;
  isCountUnavailable: boolean;
  loaded: boolean;
  outdatedVmKeys: Set<string>;
  vmsCount: number;
};

const useOutdatedVirtioDrivers = (
  options?: UseOutdatedVirtioDriversOptions,
): UseOutdatedVirtioDriversResult => {
  const namespaceParam = useNamespaceParam();
  const cluster = useActiveClusterParam();
  const { prometheusUnavailable } = usePrometheusAvailability();

  const namespace = options?.namespace ?? namespaceParam;
  const query = useMemo(
    () => buildOutdatedVirtioDriversQuery(namespace, options?.name),
    [namespace, options?.name],
  );

  const [response, loaded, error] = useFleetPrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: prometheusUnavailable ? undefined : query,
    ...(cluster === ALL_CLUSTERS_KEY && { allClusters: true }),
    ...(cluster && cluster !== ALL_CLUSTERS_KEY && { cluster }),
  });

  const outdatedVmKeys = useMemo(
    () =>
      error || prometheusUnavailable ? new Set<string>() : parseOutdatedVirtioVmKeys(response),
    [error, prometheusUnavailable, response],
  );

  const isCountUnavailable = Boolean(prometheusUnavailable || (loaded && error));

  return {
    error,
    isCountUnavailable,
    loaded: prometheusUnavailable || loaded,
    outdatedVmKeys,
    vmsCount: outdatedVmKeys.size,
  };
};

export default useOutdatedVirtioDrivers;
