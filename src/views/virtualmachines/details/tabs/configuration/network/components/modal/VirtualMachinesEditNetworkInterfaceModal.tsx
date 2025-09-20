import React, { FC, useCallback } from 'react';

import { V1Interface, V1Network, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import NetworkInterfaceModal from '@kubevirt-utils/components/NetworkInterfaceModal/NetworkInterfaceModal';
import {
  createInterface,
  createNetwork,
  PatchRequest,
  patchVM,
  prepareInterfacePatch,
  prepareNetworkPatch,
} from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInterface, getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';

type VirtualMachinesEditNetworkInterfaceModalProps = {
  isOpen: boolean;
  nicPresentation: NetworkPresentation;
  onClose: () => void;
  vm: V1VirtualMachine;
};

const VirtualMachinesEditNetworkInterfaceModal: FC<
  VirtualMachinesEditNetworkInterfaceModalProps
> = ({ isOpen, nicPresentation, onClose, vm }) => {
  const { t } = useKubevirtTranslation();

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
        const resultNetwork = createNetwork(nicName, networkName);
        const resultInterface = createInterface({
          interfaceLinkState,
          interfaceMACAddress,
          interfaceModel,
          interfaceType,
          nicName,
        });

        const existingInterface = getInterface(vm, nicName);
        const existingNetwork = getNetworks(vm).find(({ name }) => name === nicName);

        if (!existingNetwork || !existingInterface) {
          return;
        }

        const network: PatchRequest<V1Network> = {
          index: getNetworks(vm)?.indexOf(existingNetwork),
          operation: 'replace',
          prevValue: existingNetwork,
          value: { ...existingNetwork, ...resultNetwork },
        };

        const iface: PatchRequest<V1Interface> = {
          index: getInterfaces(vm)?.indexOf(existingInterface),
          operation: 'replace',
          prevValue: existingInterface,
          value: { ...existingInterface, ...resultInterface },
        };
        return patchVM(vm, [...prepareNetworkPatch(network), ...prepareInterfacePatch(iface)]);
      },
    [vm, nicPresentation],
  );

  return (
    <NetworkInterfaceModal
      fixedName
      headerText={t('Edit network interface')}
      isOpen={isOpen}
      nicPresentation={nicPresentation}
      onClose={onClose}
      onSubmit={onSubmit}
      vm={vm}
    />
  );
};

export default VirtualMachinesEditNetworkInterfaceModal;
