import React, { FC } from 'react';

import { produceVMNetworks, UpdateValidatedVM } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import NetworkInterfaceModal from '@kubevirt-utils/components/NetworkInterfaceModal/NetworkInterfaceModal';
import {
  createInterface,
  createNetwork,
} from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';

type WizardEditNetworkInterfaceModalProps = {
  isOpen: boolean;
  nicPresentation: NetworkPresentation;
  onClose: () => void;
  updateVM: UpdateValidatedVM;
  vm: V1VirtualMachine;
};

const WizardEditNetworkInterfaceModal: FC<WizardEditNetworkInterfaceModalProps> = ({
  isOpen,
  nicPresentation,
  onClose,
  updateVM,
  vm,
}) => {
  const { t } = useKubevirtTranslation();

  const onSubmit =
    ({ interfaceMACAddress, interfaceModel, interfaceType, networkName, nicName }) =>
    (currentVM) => {
      const resultNetwork = createNetwork(nicName, networkName);
      const resultInterface = createInterface(
        nicName,
        interfaceModel,
        interfaceMACAddress,
        interfaceType,
      );

      const networkProducer = produceVMNetworks(currentVM, (draftVM) => {
        draftVM.spec.template.spec.domain.devices.interfaces = [
          ...(draftVM.spec.template.spec.domain.devices.interfaces.filter(
            ({ name }) => name !== nicPresentation?.network?.name,
          ) || []),
          resultInterface,
        ];

        draftVM.spec.template.spec.networks = [
          ...(draftVM.spec.template.spec.networks.filter(
            ({ name }) => name !== nicPresentation?.network?.name,
          ) || []),
          resultNetwork,
        ];
      });

      return updateVM(networkProducer);
    };

  return (
    <NetworkInterfaceModal
      headerText={t('Edit network interface')}
      isOpen={isOpen}
      nicPresentation={nicPresentation}
      onClose={onClose}
      onSubmit={onSubmit}
      vm={vm}
    />
  );
};

export default WizardEditNetworkInterfaceModal;
