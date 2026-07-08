import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { getValidNamespace } from '@kubevirt-utils/utils/utils';
import { isACMPath } from '@multicluster/urls';
import { useActiveNamespace as useActiveNamespaceSDK } from '@openshift-console/dynamic-plugin-sdk';
import { useLocation } from 'react-router';

const useInitialNamespace = () => {
  const location = useLocation();
  const activeNamespaceFromUtil = useActiveNamespace();
  const [activeNamespaceFromSDK] = useActiveNamespaceSDK();

  const activeNamespace = isACMPath(location?.pathname)
    ? activeNamespaceFromUtil
    : activeNamespaceFromSDK;

  const initialNamespace = location?.state?.namespace ?? activeNamespace;

  return getValidNamespace(initialNamespace);
};

export default useInitialNamespace;
