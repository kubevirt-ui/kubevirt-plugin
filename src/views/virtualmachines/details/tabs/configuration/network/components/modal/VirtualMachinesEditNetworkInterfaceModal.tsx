import React, { FC, useCallback } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import NetworkInterfaceModal from '@kubevirt-utils/components/NetworkInterfaceModal/NetworkInterfaceModal';
import {
  createInterface,
  createNetwork,
} from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInterface, getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import {
  patchVM,
  updateInterface,
  updateNetwork,
} from '@kubevirt-utils/resources/vm/utils/network/patch';

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

        return patchVM(vm, [
          ...updateNetwork({
            currentValue: existingNetwork,
            index: getNetworks(vm)?.indexOf(existingNetwork),
            nextValue: resultNetwork,
          }),
          ...updateInterface({
            currentValue: existingInterface,
            index: getInterfaces(vm)?.indexOf(existingInterface),
            nextValue: resultInterface,
          }),
        ]);
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
