import { useMatch } from 'react-router-dom-v5-compat';

import { ALL_CLUSTERS_KEY } from '@kubevirt-utils/hooks/constants';
import useIsACMPage from '@multicluster/useIsACMPage';

const useActiveClusterParam = (): null | string => {
  const isACMPage = useIsACMPage();
  const allClustersMatch = useMatch(`/k8s/${ALL_CLUSTERS_KEY}/*`);
  const pathMatch = useMatch('/k8s/cluster/:cluster/*');

  if (!isACMPage) return null;

  if (allClustersMatch) return ALL_CLUSTERS_KEY;

  return pathMatch?.params?.cluster || null;
};

export default useActiveClusterParam;
