import React, { FC, useCallback } from 'react';

import {
  V1Interface,
  V1Network,
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import NetworkInterfaceModal from '@kubevirt-utils/components/NetworkInterfaceModal/NetworkInterfaceModal';
import {
  createInterface,
  createNetwork,
} from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { getInterface, getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import {
  addInterface,
  addNetwork,
  patchVM,
} from '@kubevirt-utils/resources/vm/utils/network/patch';

type VirtualMachinesNetworkInterfaceModalProps = {
  headerText: string;
  isOpen: boolean;
  onAddNetworkInterface: (
    updatedNetworks: V1Network[],
    updatedInterfaces: V1Interface[],
  ) => Promise<V1VirtualMachine>;
  onClose: () => void;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const VirtualMachinesNetworkInterfaceModal: FC<VirtualMachinesNetworkInterfaceModalProps> = ({
  headerText,
  isOpen,
  onAddNetworkInterface,
  onClose,
  vm,
}) => {
  const onSubmit = useCallback(
    ({
        interfaceLinkState,
        interfaceMACAddress,
        interfaceModel,
        interfaceType,
        networkName,
        nicName,
      }) =>
      () => {
        const existingInterface = getInterface(vm, nicName);
        const existingNetwork = getNetworks(vm)?.find(({ name }) => name === nicName);
        if (existingNetwork || existingInterface) {
          return;
        }

        const resultNetwork = createNetwork(nicName, networkName);
        const resultInterface = createInterface({
          interfaceLinkState,
          interfaceMACAddress,
          interfaceModel,
          interfaceType,
          nicName,
        });

        if (onAddNetworkInterface) {
          const updatedNetworks: V1Network[] = [...(getNetworks(vm) || []), resultNetwork];
          const updatedInterfaces: V1Interface[] = [...(getInterfaces(vm) || []), resultInterface];
          return onAddNetworkInterface(updatedNetworks, updatedInterfaces);
        }

        return patchVM(vm, [
          ...addNetwork({
            index: getNetworks(vm)?.length ?? 0,
            value: resultNetwork,
          }),
          ...addInterface({
            index: getInterfaces(vm)?.length ?? 0,
            value: resultInterface,
          }),
        ]);
      },
    [onAddNetworkInterface, vm],
  );

  return (
    <NetworkInterfaceModal
      headerText={headerText}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      vm={vm}
    />
  );
};

export default VirtualMachinesNetworkInterfaceModal;
