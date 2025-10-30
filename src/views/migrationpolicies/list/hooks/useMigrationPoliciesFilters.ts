import { useClusterFilter } from '@kubevirt-utils/hooks/useClusterFilter';
import useIsACMPage from '@multicluster/useIsACMPage';

const useMigrationPoliciesFilters = () => {
  const isACMPage = useIsACMPage();

  const clusterFilter = useClusterFilter();

  return isACMPage ? [clusterFilter] : [];
};

export default useMigrationPoliciesFilters;
