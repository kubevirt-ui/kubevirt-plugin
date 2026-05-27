import useNamespaceResources from '@kubevirt-utils/hooks/useNamespaceResources';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { getVMNetworkNamespaces } from '../utils';

const useVMNetworkMatchedNamespaces = (
  vmNetwork: ClusterUserDefinedNetworkKind,
): [matchingNamespaces: K8sResourceCommon[], loaded: boolean, error: Error] => {
  const [namespaces, loaded, error] = useNamespaceResources();

  const matchingNamespaces = getVMNetworkNamespaces(vmNetwork, namespaces);

  return [matchingNamespaces, loaded, error];
};

export default useVMNetworkMatchedNamespaces;
