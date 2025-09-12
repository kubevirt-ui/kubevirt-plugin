import React, { FC, useCallback } from 'react';

import { V1Interface, V1Network, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import NetworkInterfaceModal from '@kubevirt-utils/components/NetworkInterfaceModal/NetworkInterfaceModal';
import {
  createInterface,
  createNetwork,
  PatchUpdate,
  updateVMNetworkInterfaces2,
} from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
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

        const existingNetwork = getNetworks(vm)?.find(
          ({ name }) => name === nicPresentation?.network?.name,
        );
        const network: PatchUpdate<V1Network> = {
          index: existingNetwork
            ? getNetworks(vm)?.indexOf(existingNetwork)
            : getNetworks(vm)?.length,
          operation: existingNetwork ? 'replace' : 'add',
          prevValue: existingNetwork,
          value: resultNetwork,
        };

        const existingInterface = getInterfaces(vm)?.find(
          ({ name }) => name === nicPresentation?.network?.name,
        );
        const iface: PatchUpdate<V1Interface> = {
          index: existingInterface
            ? getInterfaces(vm)?.indexOf(existingInterface)
            : getInterfaces(vm)?.length,
          operation: existingInterface ? 'replace' : 'add',
          prevValue: existingInterface,
          value: resultInterface,
        };
        return updateVMNetworkInterfaces2(vm, network, iface);
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
