import React, { FC, useCallback } from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import {
  V1Interface,
  V1Network,
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import SharedNetworkInterfaceModal from '@kubevirt-utils/components/NetworkInterfaceModal/NetworkInterfaceModal';
import {
  createInterface,
  createNetwork,
  updateVMNetworkInterface,
} from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { ModalPendingChangesAlert } from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import { getChangedNics } from '@kubevirt-utils/components/PendingChanges/utils/helpers';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

type NetworkInterfaceModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  headerText: string;
  vmi?: V1VirtualMachineInstance;
};

const NetworkInterfaceModal: FC<NetworkInterfaceModalProps> = ({
  vm,
  isOpen,
  onClose,
  headerText,
  vmi,
}) => {
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

        const updatedNetworks: V1Network[] = [...(getNetworks(vm) || []), resultNetwork];
        const updatedInterfaces: V1Interface[] = [...(getInterfaces(vm) || []), resultInterface];
        const updatedVM = updateVMNetworkInterface(vm, updatedNetworks, updatedInterfaces);

        return k8sUpdate({
          model: VirtualMachineModel,
          data: updatedVM,
          ns: updatedVM.metadata.namespace,
          name: updatedVM.metadata.name,
        });
      },
    [vm],
  );

  return (
    <SharedNetworkInterfaceModal
      isOpen={isOpen}
      onClose={onClose}
      headerText={headerText}
      vm={vm}
      onSubmit={onSubmit}
      Header={vmi && <ModalPendingChangesAlert isChanged={getChangedNics(vm, vmi)?.length > 0} />}
    />
  );
};

export default NetworkInterfaceModal;
