import { isAllNamespaces } from '@kubevirt-utils/utils/utils';

import useCanCreateVMInDefaultNamespace from './useCanCreateVMInDefaultNamespace';
import useWizardInitialValues from './useWizardInitialValues';
import { resolveWizardNamespace } from './utils/resolveWizardNamespace';

type ResolvedWizardInitialValues = {
  cluster: string;
  error: unknown;
  isLoading: boolean;
  namespace: string;
};

const useResolvedWizardInitialValues = (): ResolvedWizardInitialValues => {
  const { cluster, hubClusterError, isLoadingHubCluster, namespace } = useWizardInitialValues();

  const shouldResolveDefaultNamespace = isAllNamespaces(namespace);

  const {
    canCreate: canCreateVMInDefaultNamespace,
    loading: isLoadingDefaultNamespaceAccessReview,
  } = useCanCreateVMInDefaultNamespace({
    cluster,
    enabled: shouldResolveDefaultNamespace,
  });

  const isLoading =
    isLoadingHubCluster || (shouldResolveDefaultNamespace && isLoadingDefaultNamespaceAccessReview);

  return {
    cluster,
    error: hubClusterError,
    isLoading,
    namespace: resolveWizardNamespace({ canCreateVMInDefaultNamespace, namespace }),
  };
};

export default useResolvedWizardInitialValues;
