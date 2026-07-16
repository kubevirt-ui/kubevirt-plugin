import { useMemo } from 'react';

import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useKubevirtWatchResources from '@multicluster/hooks/useKubevirtWatchResources';
import { type ClusterServiceVersionKind } from '@overview/utils/types';

import { type UseOperatorCsvsParams, type UseOperatorCsvsReturn } from './utils/types';
import { getCsvWatchResources, mapWatchResourceData, mapWatchResourceErrors } from './utils/utils';

const useOperatorCsvs = ({
  cluster,
  enabled = true,
  operatorGroups,
  packageManifests,
  subscriptions,
}: UseOperatorCsvsParams): UseOperatorCsvsReturn => {
  const memoizedInputs = useDeepCompareMemoize({
    enabled,
    operatorGroups,
    packageManifests,
    subscriptions,
  });

  const csvResources = useMemo(
    () =>
      memoizedInputs.enabled
        ? getCsvWatchResources(
            cluster,
            memoizedInputs.packageManifests,
            memoizedInputs.subscriptions,
            memoizedInputs.operatorGroups,
          )
        : {},
    [cluster, memoizedInputs],
  );

  const csvData =
    useKubevirtWatchResources<Record<string, ClusterServiceVersionKind>>(csvResources);

  const csvResourceKeys = useMemo(() => Object.keys(csvResources), [csvResources]);

  const clusterServiceVersions = useMemo(
    () => mapWatchResourceData(csvResourceKeys, csvData),
    [csvData, csvResourceKeys],
  );

  const loaded = useMemo(() => {
    if (!enabled) {
      return false;
    }

    if (isEmpty(csvResourceKeys)) {
      return true;
    }

    return csvResourceKeys.every((key) => csvData?.[key]?.loaded);
  }, [csvData, csvResourceKeys, enabled]);

  const loadErrors = useMemo(
    () => mapWatchResourceErrors(csvResourceKeys, csvData),
    [csvData, csvResourceKeys],
  );

  return useMemo(
    () => ({ clusterServiceVersions, loaded, loadErrors }),
    [clusterServiceVersions, loadErrors, loaded],
  );
};

export default useOperatorCsvs;
