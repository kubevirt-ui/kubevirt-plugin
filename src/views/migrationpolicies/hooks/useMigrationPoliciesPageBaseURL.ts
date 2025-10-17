import { MigrationPolicyModelRef } from '@kubevirt-utils/models';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';

export const useMigrationPoliciesPageBaseURL = () => {
  const cluster = useClusterParam();
  const isACMPage = useIsACMPage();

  if (isACMPage && cluster) {
    return `/k8s/cluster/${cluster}/${MigrationPolicyModelRef}`;
  }

  return `/k8s/cluster/${MigrationPolicyModelRef}`;
};
