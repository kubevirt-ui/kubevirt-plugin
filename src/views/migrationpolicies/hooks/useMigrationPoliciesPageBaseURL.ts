import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import { MigrationPolicyModelRef } from '@kubevirt-utils/models';
import { CLUSTER_LIST_FILTER_PARAM } from '@kubevirt-utils/utils/constants';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

export const useMigrationPoliciesPageBaseURL = () => {
  const clusters = useListClusters();
  const isACMPage = useIsACMPage();
  const [hubClusterName] = useHubClusterName();

  const cluster = clusters?.[0] || hubClusterName;

  if (isACMPage) {
    return `/k8s/all-clusters/${MigrationPolicyModelRef}?${CLUSTER_LIST_FILTER_PARAM}=${cluster}`;
  }

  return `/k8s/cluster/${MigrationPolicyModelRef}`;
};
