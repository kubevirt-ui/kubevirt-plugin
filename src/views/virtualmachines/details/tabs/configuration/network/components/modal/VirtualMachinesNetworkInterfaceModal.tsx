import React, { FC, useCallback } from 'react';
import produce from 'immer';
import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import {
  V1Disk,
  V1Interface,
  V1Network,
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import NetworkInterfaceModal from '@kubevirt-utils/components/NetworkInterfaceModal/NetworkInterfaceModal';
import {
  createInterface,
  createNetwork,
  prepareNICBootOrder,
} from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { getInterface, getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import {
  addInterface,
  addNetwork,
  patchVM,
} from '@kubevirt-utils/resources/vm/utils/network/patch';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sUpdate } from '@multicluster/k8sRequests';

type VirtualMachinesNetworkInterfaceModalProps = {
  headerText: string;
  isOpen: boolean;
  onAddNetworkInterface?: (
    updatedNetworks: V1Network[],
    updatedInterfaces: V1Interface[],
    updatedDisks?: V1Disk[],
  ) => Promise<V1VirtualMachine>;
  onClose: () => void;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const VirtualMachinesNetworkInterfaceModal: FC<VirtualMachinesNetworkInterfaceModalProps> = ({
  headerText,
  isOpen,
  onAddNetworkInterface,
  onClose,
  vm,
}) => {
  const onSubmit = useCallback(
    ({
        interfaceLinkState,
        interfaceMACAddress,
        interfaceModel,
        interfaceType,
        isBootSource = false,
        isLegacyPasst,
        networkName,
        nicName,
      }) =>
      () => {
        const existingInterface = getInterface(vm, nicName);
        const existingNetwork = getNetworks(vm)?.find(({ name }) => name === nicName);
        if (existingNetwork || existingInterface) {
          return;
        }

        const resultNetwork = createNetwork(nicName, networkName);
        const resultInterface = createInterface({
          interfaceLinkState,
          interfaceMACAddress,
          interfaceModel,
          interfaceType,
          isLegacyPasst,
          nicName,
        });

        const { disksWithOrder, needsDiskUpdate, nicBootOrder } = prepareNICBootOrder(vm);
        if (isBootSource) resultInterface.bootOrder = nicBootOrder;

        if (onAddNetworkInterface) {
          const updatedNetworks: V1Network[] = [...(getNetworks(vm) || []), resultNetwork];
          const updatedInterfaces: V1Interface[] = [...(getInterfaces(vm) || []), resultInterface];
          return onAddNetworkInterface(
            updatedNetworks,
            updatedInterfaces,
            isBootSource && needsDiskUpdate ? disksWithOrder : undefined,
          );
        }

        if (isBootSource && needsDiskUpdate) {
          const newVM = produce(vm, (draftVM) => {
            draftVM.spec!.template!.spec!.domain!.devices!.disks = disksWithOrder;
            getNetworks(draftVM)!.push(resultNetwork);
            getInterfaces(draftVM)!.push(resultInterface);
          });
          return kubevirtK8sUpdate({
            cluster: getCluster(vm),
            data: newVM,
            model: VirtualMachineModel,
            name: newVM.metadata?.name,
            ns: newVM.metadata?.namespace,
          });
        }

        return patchVM(vm, [
          ...addNetwork({
            index: getNetworks(vm)?.length ?? 0,
            value: resultNetwork,
          }),
          ...addInterface({
            index: getInterfaces(vm)?.length ?? 0,
            value: resultInterface,
          }),
        ]);
      },
    [onAddNetworkInterface, vm],
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

export default VirtualMachinesNetworkInterfaceModal;
