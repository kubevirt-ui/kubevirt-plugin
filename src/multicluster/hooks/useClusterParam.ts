import { useMatch } from 'react-router';

import { FLEET_BASE_PATH } from '@multicluster/constants';
import useIsACMPage from '@multicluster/useIsACMPage';

const useClusterParam = () => {
  const isACMPage = useIsACMPage();
  const pathMatch = useMatch(`${FLEET_BASE_PATH}/:page/cluster/:cluster/*`);

  if (!isACMPage) return null;

  return pathMatch?.params?.cluster;
};

export default useClusterParam;
