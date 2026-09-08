import React, { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { produceVMNetworks } from '@kubevirt-utils/components/DiskModal/utils/helpers';
import NetworkInterfaceModal from '@kubevirt-utils/components/NetworkInterfaceModal/NetworkInterfaceModal';
import { type NetworkInterfaceModalOnSubmit } from '@kubevirt-utils/components/NetworkInterfaceModal/types';
import {
  createInterface,
  createNetwork,
} from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';

import { type UpdateVM } from './WizardNetworkInterfaceModal';

type WizardEditNetworkInterfaceModalProps = {
  isOpen: boolean;
  nicPresentation: NetworkPresentation;
  onClose: () => void;
  updateVM: UpdateVM;
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

  const filterByNicName = ({ name }: { name: string }): boolean =>
    name !== nicPresentation?.network?.name;

  const onSubmit =
    ({
      interfaceLinkState,
      interfaceMACAddress,
      interfaceModel,
      interfaceType,
      isLegacyPasst,
      networkName,
      nicName,
    }: NetworkInterfaceModalOnSubmit) =>
    (currentVM: V1VirtualMachine): Promise<void> => {
      const resultNetwork = createNetwork(nicName, networkName);
      const resultInterface = createInterface({
        interfaceLinkState,
        interfaceMACAddress,
        interfaceModel,
        interfaceType,
        isLegacyPasst,
        nicName,
      });

      const networkProducer = produceVMNetworks(currentVM, (draftVM) => {
        draftVM.spec.template.spec.domain.devices.interfaces = [
          ...(draftVM.spec.template.spec.domain.devices.interfaces.filter(filterByNicName) ?? []),
          resultInterface,
        ];

        draftVM.spec.template.spec.networks = [
          ...(draftVM.spec.template.spec.networks.filter(filterByNicName) ?? []),
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
