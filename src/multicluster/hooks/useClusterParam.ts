import { useMatch } from 'react-router-dom-v5-compat';

import useIsACMPage from '@multicluster/useIsACMPage';

const useClusterParam = () => {
  const isACMPage = useIsACMPage();
  const pathMatch = useMatch('/k8s/cluster/:cluster/*');

  if (!isACMPage) return null;

  return pathMatch?.params?.cluster;
};

export default useClusterParam;
