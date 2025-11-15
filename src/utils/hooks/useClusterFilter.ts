import { useMemo } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { CLUSTER_LIST_FILTER_TYPE } from '@kubevirt-utils/utils/constants';
import { isEmpty, universalComparator } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetClusterNames, useHubClusterName } from '@stolostron/multicluster-sdk';

export const useClusterFilter = <R extends K8sResourceCommon>(): RowFilter<R> => {
  const [clusters] = useFleetClusterNames();
  const [hubClusterName] = useHubClusterName();

  return useMemo(
    () => ({
      filter: (input, obj) => {
        if (isEmpty(input.selected)) {
          return true;
        }

        return input.selected.some((cluster) => {
          const isHubCluster = cluster === hubClusterName && isEmpty(getCluster(obj));
          return cluster === getCluster(obj) || isHubCluster;
        });
      },
      filterGroupName: t('Cluster'),
      isMatch: () => true,
      items: clusters
        ?.sort((a, b) => universalComparator(a, b))
        .map((cluster) => ({
          id: cluster,
          title: cluster,
        })),
      type: CLUSTER_LIST_FILTER_TYPE,
    }),
    [clusters],
  );
};
