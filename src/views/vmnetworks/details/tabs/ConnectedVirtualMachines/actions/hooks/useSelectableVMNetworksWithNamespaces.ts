import { useMemo } from 'react';
import useVMNetworks from 'src/views/vmnetworks/hooks/useVMNetworks';
import { getVMNetworkNamespaces } from 'src/views/vmnetworks/utils';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import useNamespaceResources from '@kubevirt-utils/hooks/useNamespaceResources';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

import { VMNetworkWithNamespaces } from '../types';

type UseSelectableVMNetworksWithNamespaces = (
  currentNetworkName: string,
  vms: V1VirtualMachine[],
) => [vmNetworksWithNamespaces: VMNetworkWithNamespaces[], loaded: boolean, error: Error];

/**
 * This hook returns VM networks (with their matching namespace names) that can be selected for the given set of VMs.
 * For each network it checks if the network namespaceSelector covers all the namespaces of the VMs. It also filters out the current network.
 *
 * @param currentNetworkName - The name of the current network.
 * @param vms - The VMs to check.
 * @returns The selectable VM networks with their matching namespace names, loaded status, and error.
 */
const useSelectableVMNetworksWithNamespaces: UseSelectableVMNetworksWithNamespaces = (
  currentNetworkName,
  vms,
) => {
  const [vmNetworks, vmNetworksLoaded, vmNetworksError] = useVMNetworks();
  const [namespaces, namespacesLoaded, namespacesError] = useNamespaceResources();

  const vmNamespaces = useMemo(() => vms?.map((vm) => getNamespace(vm)) ?? [], [vms]);

  const vmNetworksWithNamespaces = useMemo(
    () =>
      vmNetworks
        ?.map((vmNetwork) => {
          const namespaceNames = getVMNetworkNamespaces(vmNetwork, namespaces).map((ns) =>
            getName(ns),
          );

          return { namespaceNames, vmNetworkName: getName(vmNetwork) };
        })
        .filter(({ namespaceNames, vmNetworkName }) => {
          if (vmNetworkName === currentNetworkName) return false;

          return (
            namespaceNames.includes(DEFAULT_NAMESPACE) ||
            vmNamespaces.every((ns) => namespaceNames.includes(ns))
          );
        }),
    [vmNetworks, namespaces, vmNamespaces, currentNetworkName],
  );

  return [
    vmNetworksWithNamespaces,
    vmNetworksLoaded && namespacesLoaded,
    vmNetworksError || namespacesError,
  ];
};

export default useSelectableVMNetworksWithNamespaces;
