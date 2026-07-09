import React, { FC, useCallback } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { produceVMNetworks } from '@kubevirt-utils/components/DiskModal/utils/helpers';
import NetworkInterfaceModal from '@kubevirt-utils/components/NetworkInterfaceModal/NetworkInterfaceModal';
import {
  createInterface,
  createNetwork,
} from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';

export type UpdateVM = (updatedVM: V1VirtualMachine) => Promise<void>;

type WizardNetworkInterfaceModalProps = {
  headerText: string;
  isOpen: boolean;
  onClose: () => void;
  updateVM: UpdateVM;
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
    ({
      interfaceLinkState,
      interfaceMACAddress,
      interfaceModel,
      interfaceType,
      isLegacyPasst,
      networkName,
      nicName,
    }) =>
      (currentVM: V1VirtualMachine) => {
        const resultNetwork = createNetwork(nicName, networkName);
        const resultInterface = createInterface({
          interfaceLinkState,
          interfaceMACAddress,
          interfaceModel,
          interfaceType,
          isLegacyPasst,
          nicName,
        });

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
