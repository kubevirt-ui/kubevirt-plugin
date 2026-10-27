import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { isAllNamespaces } from '@kubevirt-utils/utils/utils';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { getCanCreateVMFleetAccessReview } from '@virtualmachines/list/utils/utils';

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

  const [canCreateVMInDefaultNamespace, isLoadingDefaultNamespaceAccessReview] =
    useFleetAccessReview(getCanCreateVMFleetAccessReview(DEFAULT_NAMESPACE, cluster));

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
