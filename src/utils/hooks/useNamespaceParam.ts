import { useMatch } from 'react-router-dom-v5-compat';

const useNamespaceParam = () => {
  const multiclusterPathMatch = useMatch('/k8s/cluster/:cluster/ns/:ns/*');
  const pathMatch = useMatch('/k8s/ns/:ns/*');

  return pathMatch?.params?.ns || multiclusterPathMatch?.params?.ns;
};

export default useNamespaceParam;
