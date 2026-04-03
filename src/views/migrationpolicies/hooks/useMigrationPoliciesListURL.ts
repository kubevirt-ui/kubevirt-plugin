import { MigrationPolicyModelRef } from '@kubevirt-utils/models';
import { CLUSTER_LIST_FILTER_PARAM } from '@kubevirt-utils/utils/constants';
import { FLEET_MIGRATION_POLICIES_PATH } from '@multicluster/constants';
import useCluster from '@multicluster/hooks/useCluster';
import useIsACMPage from '@multicluster/useIsACMPage';

export const useMigrationPoliciesListURL = () => {
  const isACMPage = useIsACMPage();
  const cluster = useCluster();

  if (isACMPage) {
    return `${FLEET_MIGRATION_POLICIES_PATH}/all-clusters?${CLUSTER_LIST_FILTER_PARAM}=${cluster}`;
  }

  return `/k8s/cluster/${MigrationPolicyModelRef}`;
};
