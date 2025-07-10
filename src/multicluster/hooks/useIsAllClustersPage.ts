import { isEmpty } from '@kubevirt-utils/utils/utils';
import useIsACMPage from '@multicluster/useIsACMPage';

import useClusterParam from './useClusterParam';

const useIsAllClustersPage = () => {
  const cluster = useClusterParam();
  const isACMPage = useIsACMPage();

  return isACMPage && isEmpty(cluster);
};

export default useIsAllClustersPage;
