import React, { FC, useCallback } from 'react';

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
    ({ interfaceMACAddress, interfaceModel, interfaceType, networkName, nicName }) =>
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
          data: updatedVM,
          model: VirtualMachineModel,
          name: updatedVM.metadata.name,
          ns: updatedVM.metadata.namespace,
        });
      },
    [vm, nicPresentation],
  );

  return (
    <NetworkInterfaceModal
      fixedName
      headerText={t('Edit network interface')}
      isEdit
      isOpen={isOpen}
      nicPresentation={nicPresentation}
      onClose={onClose}
      onSubmit={onSubmit}
      vm={vm}
    />
  );
};

export default VirtualMachinesEditNetworkInterfaceModal;
