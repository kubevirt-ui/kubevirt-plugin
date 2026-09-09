import { ALL_NAMESPACES_SESSION_KEY } from './constants';
import useNamespaceParam from './useNamespaceParam';

const useActiveNamespace = (): string => {
  const namespaceParam = useNamespaceParam();
  return namespaceParam ?? ALL_NAMESPACES_SESSION_KEY;
};

export default useActiveNamespace;
