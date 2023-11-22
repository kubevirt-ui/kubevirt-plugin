import React, { FC, useCallback } from 'react';

import { produceVMNetworks, UpdateValidatedVM } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import NetworkInterfaceModal from '@kubevirt-utils/components/NetworkInterfaceModal/NetworkInterfaceModal';
import {
  createInterface,
  createNetwork,
} from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';

type WizardNetworkInterfaceModalProps = {
  headerText: string;
  isOpen: boolean;
  onClose: () => void;
  updateVM: UpdateValidatedVM;
  vm: V1VirtualMachine;
};

const WizardNetworkInterfaceModal: FC<WizardNetworkInterfaceModalProps> = ({
  headerText,
  isOpen,
  onClose,
  updateVM,
  vm,
}) => {
  const onSubmit = useCallback(
    ({ interfaceMACAddress, interfaceModel, interfaceType, networkName, nicName }) =>
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
    <NetworkInterfaceModal
      headerText={headerText}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      vm={vm}
    />
  );
};

export default WizardNetworkInterfaceModal;
