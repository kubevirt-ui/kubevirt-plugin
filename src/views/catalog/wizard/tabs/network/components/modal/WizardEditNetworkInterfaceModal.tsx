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
  vm: V1VirtualMachine;
  updateVM: UpdateValidatedVM;
  isOpen: boolean;
  onClose: () => void;
  nicPresentation: NetworkPresentation;
};

const WizardEditNetworkInterfaceModal: FC<WizardEditNetworkInterfaceModalProps> = ({
  vm,
  updateVM,
  isOpen,
  onClose,
  nicPresentation,
}) => {
  const { t } = useKubevirtTranslation();

  const onSubmit =
    ({ nicName, networkName, interfaceModel, interfaceMACAddress, interfaceType }) =>
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
      vm={vm}
      headerText={t('Edit network interface')}
      onSubmit={onSubmit}
      nicPresentation={nicPresentation}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};

export default WizardEditNetworkInterfaceModal;
