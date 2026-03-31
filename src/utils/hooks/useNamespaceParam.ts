import { useMatch } from 'react-router-dom-v5-compat';

import { FLEET_BASE_PATH } from '@multicluster/constants';

const useNamespaceParam = () => {
  const multiclusterPathMatch = useMatch(`${FLEET_BASE_PATH}/cluster/:cluster/ns/:ns/*`);
  const pathMatch = useMatch('/k8s/ns/:ns/*');

  return pathMatch?.params?.ns || multiclusterPathMatch?.params?.ns;
};

export default useNamespaceParam;
