import { useMatch } from 'react-router';

import { FLEET_BASE_PATH } from '@multicluster/constants';

const useNamespaceParam = (): string | undefined => {
  const multiclusterPathMatch = useMatch(`${FLEET_BASE_PATH}/:page/cluster/:cluster/ns/:ns/*`);
  const pathMatch = useMatch('/k8s/ns/:ns/*');

  return pathMatch?.params?.ns ?? multiclusterPathMatch?.params?.ns;
};

export default useNamespaceParam;
