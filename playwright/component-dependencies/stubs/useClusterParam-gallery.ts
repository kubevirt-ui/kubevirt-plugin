/**
 * Gallery alias for `@multicluster/hooks/useClusterParam`.
 * Reads `:cluster` from the fleet URL when the scene route is under ACM paths.
 */
import { useMatch } from 'react-router';

import { FLEET_BASE_PATH } from '@multicluster/constants';
import useIsACMPage from '@multicluster/useIsACMPage';

/** Active fleet cluster param, or `undefined` on single-cluster gallery routes. */
const useClusterParam = (): string | undefined => {
  const isACMPage = useIsACMPage();
  const pathMatch = useMatch(`${FLEET_BASE_PATH}/:page/cluster/:cluster/*`);

  if (!isACMPage) return undefined;

  return pathMatch?.params?.cluster;
};

export default useClusterParam;
