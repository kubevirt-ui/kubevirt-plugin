import { ALL_NAMESPACES_SESSION_KEY } from './constants';
import useNamespaceParam from './useNamespaceParam';

const useActiveNamespace = () => {
  const namespaceParam = useNamespaceParam();
  return namespaceParam || ALL_NAMESPACES_SESSION_KEY;
};

export default useActiveNamespace;
