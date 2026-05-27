import useVMNetworkMatchedNamespaces from 'src/views/vmnetworks/hooks/useVMNetworkMatchedNamespaces';

import { getName } from '@kubevirt-utils/resources/shared';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';

import useConnectedVMsWithNamespace from '../../../hooks/useConnectedVMsWithNamespace';
import { NamespaceWithVMCount } from '../../../types';

type UseNamespacesWithVMCounts = (
  obj: ClusterUserDefinedNetworkKind,
) => [namespacesWithVMCounts: NamespaceWithVMCount[], loaded: boolean, error: Error];

const useNamespacesWithVMCounts: UseNamespacesWithVMCounts = (obj) => {
  const [matchingNamespaces, namespacesLoaded] = useVMNetworkMatchedNamespaces(obj);
  const [vmsWithNetworkNamespace, vmsLoaded, vmsError] = useConnectedVMsWithNamespace(getName(obj));

  const result = matchingNamespaces.map((namespace) => {
    const namespaceName = getName(namespace);
    return {
      namespaceName,
      vmCount: vmsWithNetworkNamespace.filter(({ namespace }) => namespace === namespaceName).length,
    };
  });

  return [result, namespacesLoaded && vmsLoaded, vmsError];
};

export default useNamespacesWithVMCounts;
