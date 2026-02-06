import { V1Network, V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { deleteNetworkInterface } from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { updateNetwork } from '@kubevirt-utils/resources/vm/utils/network/patch';
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

const removeNetworkFromVM = (vm: V1VirtualMachine, vmNetworkName: string) => {
  const networksToRemove = getMatchingNetworks(vm, vmNetworkName);
  const interfaces = getInterfaces(vm);

  networksToRemove.forEach((network) => {
    const iface = interfaces.find((i) => i.name === network.name);
    if (iface) {
      deleteNetworkInterface(vm, iface.name, { iface, network });
    }
  });
};

export const disconnectVMsFromNetwork = (vms: V1VirtualMachine[], vmNetworkName: string) => {
  vms.forEach((vm) => removeNetworkFromVM(vm, vmNetworkName));
};

const getNewNetworkName = (
  vm: V1VirtualMachine,
  newVMNetworkName: string,
  matchingProjectNames: string[],
) => {
  if (matchingProjectNames.includes(getNamespace(vm))) {
    return newVMNetworkName;
  }
  return `${DEFAULT_NAMESPACE}/${newVMNetworkName}`;
};

const replaceNetworkInVM = (
  vm: V1VirtualMachine,
  oldNetworkName: string,
  newVMNetworkName: string,
  matchingProjectNames: string[],
) => {
  const oldNetworks = getMatchingNetworks(vm, oldNetworkName);
  const newNetworkName = getNewNetworkName(vm, newVMNetworkName, matchingProjectNames);

  oldNetworks.forEach((oldNetwork) => {
    const network: V1Network = {
      ...oldNetwork,
      multus: {
        ...oldNetwork.multus,
        networkName: newNetworkName,
      },
    };
    updateNetwork({
      currentValue: oldNetwork,
      index: getNetworks(vm).findIndex((n) => n.name === oldNetwork.name),
      nextValue: network,
    });
  });
};

export const moveVMsToNewNetwork = (
  vms: V1VirtualMachine[],
  oldNetworkName: string,
  newVMNetworkName: string,
  matchingProjectNames: string[],
) => {
  vms.forEach((vm) =>
    replaceNetworkInVM(vm, oldNetworkName, newVMNetworkName, matchingProjectNames),
  );
};
