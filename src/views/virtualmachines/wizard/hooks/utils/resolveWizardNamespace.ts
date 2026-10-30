import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { isAllNamespaces } from '@kubevirt-utils/utils/utils';

type ResolveWizardNamespaceParams = {
  canCreateVMInDefaultNamespace: boolean;
  namespace: string | undefined;
};

export const resolveWizardNamespace = ({
  canCreateVMInDefaultNamespace,
  namespace,
}: ResolveWizardNamespaceParams): string => {
  if (!isAllNamespaces(namespace)) return namespace ?? '';

  return canCreateVMInDefaultNamespace ? DEFAULT_NAMESPACE : '';
};
