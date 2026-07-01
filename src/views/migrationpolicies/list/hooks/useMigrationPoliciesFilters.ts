import useClusterFilter from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/filters/useClusterFilter';
import { type KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import useIsACMPage from '@multicluster/useIsACMPage';

const useMigrationPoliciesFilters = (): KubevirtFilter[] => {
  const isACMPage = useIsACMPage();

  const clusterFilter = useClusterFilter();

  return isACMPage ? [clusterFilter] : [];
};

export default useMigrationPoliciesFilters;
