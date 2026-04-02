import { MigrationPolicyModelRef } from '@kubevirt-utils/models';
import { CLUSTER_LIST_FILTER_PARAM } from '@kubevirt-utils/utils/constants';
import useCluster from '@multicluster/hooks/useCluster';
import useIsACMPage from '@multicluster/useIsACMPage';

export const useMigrationPoliciesListURL = () => {
  const isACMPage = useIsACMPage();
  const cluster = useCluster();

  if (isACMPage) {
    return `/k8s/all-clusters/${MigrationPolicyModelRef}?${CLUSTER_LIST_FILTER_PARAM}=${cluster}`;
  }

  return `/k8s/cluster/${MigrationPolicyModelRef}`;
};
