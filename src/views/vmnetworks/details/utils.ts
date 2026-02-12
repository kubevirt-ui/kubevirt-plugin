import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getNetworks } from '@kubevirt-utils/resources/vm/utils/selectors';

/**
 * Get the namespace of the network that the VM is connected to.
 * The multus.networkName format can be:
 * - `<networkName>` (same namespace as VM)
 * - `<namespace>/<networkName>` (explicit namespace)
 *
 * @param vm - The VM to get the network namespace for.
 * @param vmNetworkName - The name of the VM network to get the namespace for.
 * @returns The namespace of the network that the VM is connected to.
 */
export const getMatchingNetworkNamespace = (
  vm: V1VirtualMachine,
  vmNetworkName: string,
): string | undefined => {
  const networks = getNetworks(vm) ?? [];

  for (const network of networks) {
    const multusNetworkName = network.multus?.networkName;

    if (!multusNetworkName) continue;

    if (multusNetworkName === vmNetworkName) return getNamespace(vm);

    // Check if it matches in namespace/networkName format
    const [namespace, networkName] = multusNetworkName.split('/');
    if (networkName === vmNetworkName) return namespace;
  }

  return undefined;
};
