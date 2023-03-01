import React, { useCallback } from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1Interface, V1Network, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import NetworkInterfaceModal from '@kubevirt-utils/components/NetworkInterfaceModal/NetworkInterfaceModal';
import {
  createInterface,
  createNetwork,
  updateVMNetworkInterface,
} from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

type EditNetworkInterfaceModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  nicPresentation: NetworkPresentation;
};

const EditNetworkInterfaceModal: React.FC<EditNetworkInterfaceModalProps> = ({
  vm,
  isOpen,
  onClose,
  nicPresentation,
}) => {
  const { t } = useKubevirtTranslation();

  const onSubmit = useCallback(
    ({ nicName, networkName, interfaceModel, interfaceMACAddress, interfaceType }) =>
      () => {
        const resultNetwork = createNetwork(nicName, networkName);
        const resultInterface = createInterface(
          nicName,
          interfaceModel,
          interfaceMACAddress,
          interfaceType,
        );

        const updatedNetworks: V1Network[] = [
          ...(getNetworks(vm)?.filter(({ name }) => name !== nicPresentation?.network?.name) || []),
          resultNetwork,
        ];
        const updatedInterfaces: V1Interface[] = [
          ...(getInterfaces(vm)?.filter(({ name }) => name !== nicPresentation?.network?.name) ||
            []),
          resultInterface,
        ];
        const updatedVM = updateVMNetworkInterface(vm, updatedNetworks, updatedInterfaces);

        return k8sUpdate({
          model: VirtualMachineModel,
          data: updatedVM,
          ns: updatedVM.metadata.namespace,
          name: updatedVM.metadata.name,
        });
      },
    [vm, nicPresentation],
  );

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

export default EditNetworkInterfaceModal;
