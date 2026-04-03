import { useMatch } from 'react-router-dom-v5-compat';

import { ALL_CLUSTERS_KEY } from '@kubevirt-utils/hooks/constants';
import { FLEET_BASE_PATH } from '@multicluster/constants';
import useIsACMPage from '@multicluster/useIsACMPage';

const useActiveClusterParam = (): null | string => {
  const isACMPage = useIsACMPage();
  const allClustersMatch = useMatch(`${FLEET_BASE_PATH}/:page/${ALL_CLUSTERS_KEY}/*`);
  const pathMatch = useMatch(`${FLEET_BASE_PATH}/:page/cluster/:cluster/*`);

  if (!isACMPage) return null;

  if (allClustersMatch) return ALL_CLUSTERS_KEY;

  return pathMatch?.params?.cluster || null;
};

export default useActiveClusterParam;
