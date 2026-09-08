import { type V1Network, type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { deleteNetworkInterface } from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { patchVM, updateNetwork } from '@kubevirt-utils/resources/vm/utils/network/patch';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm/utils/selectors';

const getMatchingNetworks = (vm: V1VirtualMachine, vmNetworkName: string): V1Network[] => {
  const networks = getNetworks(vm);
  return networks.filter((network) => {
    const multusNetworkName = network.multus?.networkName;
    return (
      multusNetworkName &&
      (multusNetworkName === vmNetworkName || multusNetworkName.split('/')[1] === vmNetworkName)
    );
  });
};

const removeNetworkFromVM = async (
  vm: V1VirtualMachine,
  vmNetworkName: string,
): Promise<V1VirtualMachine[]> => {
  const networksToRemove = getMatchingNetworks(vm, vmNetworkName);
  const interfaces = getInterfaces(vm);

  const removalPromises: Promise<V1VirtualMachine>[] = [];

  for (const network of networksToRemove) {
    const iface = interfaces.find((i) => i.name === network.name);
    if (!iface) continue;

    const removal = deleteNetworkInterface(vm, iface.name, { iface, network });
    if (removal) removalPromises.push(removal);
  }

  return Promise.all(removalPromises);
};

export const disconnectVMsFromNetwork = async (
  vms: V1VirtualMachine[],
  vmNetworkName: string,
): Promise<V1VirtualMachine[][]> => {
  return Promise.all(vms.map((vm) => removeNetworkFromVM(vm, vmNetworkName)));
};

const getNewNetworkName = (
  vm: V1VirtualMachine,
  newVMNetworkName: string,
  matchingProjectNames: string[],
): string => {
  if (matchingProjectNames.includes(getNamespace(vm))) {
    return newVMNetworkName;
  }
  return `${DEFAULT_NAMESPACE}/${newVMNetworkName}`;
};

const replaceNetworkInVM = async (
  vm: V1VirtualMachine,
  oldNetworkName: string,
  newVMNetworkName: string,
  matchingProjectNames: string[],
): Promise<V1VirtualMachine> => {
  const oldNetworks = getMatchingNetworks(vm, oldNetworkName);
  const newNetworkName = getNewNetworkName(vm, newVMNetworkName, matchingProjectNames);

  const patchItems = oldNetworks.flatMap((oldNetwork) => {
    const network: V1Network = {
      ...oldNetwork,
      multus: {
        ...oldNetwork.multus,
        networkName: newNetworkName,
      },
    };
    return updateNetwork({
      currentValue: oldNetwork,
      index: getNetworks(vm).findIndex((net) => net.name === oldNetwork.name),
      nextValue: network,
    });
  });

  return patchVM(vm, patchItems);
};

export const moveVMsToNewNetwork = async (
  vms: V1VirtualMachine[],
  oldNetworkName: string,
  newVMNetworkName: string,
  matchingProjectNames: string[],
): Promise<V1VirtualMachine[]> => {
  return Promise.all(
    vms.map((vm) => replaceNetworkInVM(vm, oldNetworkName, newVMNetworkName, matchingProjectNames)),
  );
};
