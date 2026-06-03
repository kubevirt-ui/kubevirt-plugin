import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { CLUSTER_LIST_FILTER_TYPE } from '@kubevirt-utils/utils/constants';
import { universalComparator } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { useFleetClusterNames, useHubClusterName } from '@stolostron/multicluster-sdk';

import { KubevirtFilter, KubevirtFilterLayout } from '../types';

const useClusterFilter = (): KubevirtFilter => {
  const { t } = useKubevirtTranslation();
  const [clusters] = useFleetClusterNames();
  const [hubClusterName] = useHubClusterName();

  return useMemo(
    () => ({
      categoryLabel: t('Cluster'),
      filterLayout: KubevirtFilterLayout.SELECT,
      id: CLUSTER_LIST_FILTER_TYPE,
      match: (obj, selected) =>
        selected.some((cluster) => {
          const isHubCluster = cluster === hubClusterName && !getCluster(obj);
          return cluster === getCluster(obj) || isHubCluster;
        }),
      options: (clusters ?? [])
        .sort((a, b) => universalComparator(a, b))
        .map((cluster) => ({ label: cluster, value: cluster })),
    }),
    [clusters, hubClusterName, t],
  );
};

export default useClusterFilter;
