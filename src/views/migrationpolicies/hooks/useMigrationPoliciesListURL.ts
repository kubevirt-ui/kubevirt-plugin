import { MigrationPolicyModelRef } from '@kubevirt-utils/models';
import { CLUSTER_LIST_FILTER_PARAM } from '@kubevirt-utils/utils/constants';
import { FLEET_BASE_PATH } from '@multicluster/constants';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

export const useMigrationPoliciesListURL = () => {
  const isACMPage = useIsACMPage();
  const [hubClusterName] = useHubClusterName();
  const clusterParam = useClusterParam();
  const cluster = clusterParam || hubClusterName;

  if (isACMPage) {
    return `${FLEET_BASE_PATH}/all-clusters/${MigrationPolicyModelRef}?${CLUSTER_LIST_FILTER_PARAM}=${cluster}`;
  }

  return `/k8s/cluster/${MigrationPolicyModelRef}`;
};
