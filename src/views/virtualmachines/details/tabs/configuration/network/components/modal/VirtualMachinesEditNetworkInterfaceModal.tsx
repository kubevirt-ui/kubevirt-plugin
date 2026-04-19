import React, { FC, useCallback } from 'react';
import produce from 'immer';
import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { V1Interface, V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import NetworkInterfaceModal from '@kubevirt-utils/components/NetworkInterfaceModal/NetworkInterfaceModal';
import {
  createInterface,
  createNetwork,
  prepareNICBootOrder,
} from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInterface, getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import {
  patchVM,
  updateInterface,
  updateNetwork,
} from '@kubevirt-utils/resources/vm/utils/network/patch';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sUpdate } from '@multicluster/k8sRequests';

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
        const resultNetwork = createNetwork(nicName, networkName);
        const resultInterface = createInterface({
          interfaceLinkState,
          interfaceMACAddress,
          interfaceModel,
          interfaceType,
          isLegacyPasst,
          nicName,
        });

        const existingInterface = getInterface(vm, nicName);
        const existingNetwork = getNetworks(vm).find(({ name }) => name === nicName);

        if (!existingNetwork || !existingInterface) {
          return;
        }

        const wasBootSource = Boolean(existingInterface?.bootOrder);

        if (isBootSource !== wasBootSource) {
          const { disksWithOrder, needsDiskUpdate, nicBootOrder } = prepareNICBootOrder(vm);
          if (isBootSource) resultInterface.bootOrder = nicBootOrder;

          const newVM = produce(vm, (draftVM) => {
            if (isBootSource && needsDiskUpdate) {
              draftVM.spec!.template!.spec!.domain!.devices!.disks = disksWithOrder;
            }
            const ifaces = getInterfaces(draftVM)!;
            const networks = getNetworks(draftVM)!;
            const ifaceIndex = ifaces.findIndex((i) => i.name === nicName);
            const netIndex = networks.findIndex((n) => n.name === nicName);
            if (ifaceIndex >= 0) {
              // Merge to preserve any extra fields not modeled by the form (mirrors updateInterface).
              const mergedIface: V1Interface = { ...existingInterface, ...resultInterface };
              if (!resultInterface.bridge) delete mergedIface.bridge;
              if (!resultInterface.masquerade) delete mergedIface.masquerade;
              if (!resultInterface.sriov) delete mergedIface.sriov;
              if (!resultInterface.binding) delete mergedIface.binding;
              if (!resultInterface.passtBinding) delete mergedIface.passtBinding;
              if (!isBootSource) delete mergedIface.bootOrder;
              ifaces[ifaceIndex] = mergedIface;
            }
            if (netIndex >= 0) networks[netIndex] = { ...existingNetwork, ...resultNetwork };
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
          ...updateNetwork({
            currentValue: existingNetwork,
            index: getNetworks(vm)?.indexOf(existingNetwork),
            nextValue: resultNetwork,
          }),
          ...updateInterface({
            currentValue: existingInterface,
            index: getInterfaces(vm)?.indexOf(existingInterface),
            nextValue: resultInterface,
          }),
        ]);
      },
    [vm],
  );

  return (
    <NetworkInterfaceModal
      fixedName
      headerText={t('Edit network interface')}
      isOpen={isOpen}
      nicPresentation={nicPresentation}
      onClose={onClose}
      onSubmit={onSubmit}
      vm={vm}
    />
  );
};

export default VirtualMachinesEditNetworkInterfaceModal;
