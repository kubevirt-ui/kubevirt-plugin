import React, { useCallback } from 'react';

import { produceVMNetworks, UpdateValidatedVM } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SharedNetworkInterfaceModal from '@kubevirt-utils/components/NetworkInterfaceModal/NetworkInterfaceModal';
import {
  createInterface,
  createNetwork,
} from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';

type NetworkInterfaceModalProps = {
  vm: V1VirtualMachine;
  updateVM: UpdateValidatedVM;
  isOpen: boolean;
  onClose: () => void;
  headerText: string;
};

const NetworkInterfaceModal: React.FC<NetworkInterfaceModalProps> = ({
  vm,
  updateVM,
  isOpen,
  onClose,
  headerText,
}) => {
  const onSubmit = useCallback(
    ({ nicName, networkName, interfaceModel, interfaceMACAddress, interfaceType }) =>
      (currentVM: V1VirtualMachine) => {
        const resultNetwork = createNetwork(nicName, networkName);
        const resultInterface = createInterface(
          nicName,
          interfaceModel,
          interfaceMACAddress,
          interfaceType,
        );

        const networkProducer = produceVMNetworks(currentVM, (draft) => {
          draft.spec.template.spec.domain.devices.interfaces.push(resultInterface);
          draft.spec.template.spec.networks.push(resultNetwork);
        });

        return updateVM(networkProducer);
      },
    [updateVM],
  );

  return (
    <SharedNetworkInterfaceModal
      vm={vm}
      isOpen={isOpen}
      onClose={onClose}
      headerText={headerText}
      onSubmit={onSubmit}
    />
  );
};

export default NetworkInterfaceModal;
