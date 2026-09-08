import React, { type FC, useCallback } from 'react';
import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import NetworkInterfaceModal from '@kubevirt-utils/components/NetworkInterfaceModal/NetworkInterfaceModal';
import { type NetworkInterfaceModalOnSubmit } from '@kubevirt-utils/components/NetworkInterfaceModal/types';
import {
  createInterface,
  createNetwork,
} from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInterface, getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { type NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import {
  patchVM,
  updateInterface,
  updateNetwork,
} from '@kubevirt-utils/resources/vm/utils/network/patch';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sUpdate } from '@multicluster/k8sRequests';

import { produceUpdatedVM } from './editNetworkInterfaceUtils';

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
    }: NetworkInterfaceModalOnSubmit): (() => Promise<V1VirtualMachine> | undefined) => {
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
      const existingNetwork = getNetworks(vm)?.find(({ name }) => name === nicName);

      return () => {
        if (!existingNetwork || !existingInterface) {
          return;
        }

        const wasBootSource = Boolean(existingInterface?.bootOrder);

        if (isBootSource !== wasBootSource) {
          const newVM = produceUpdatedVM(
            vm,
            isBootSource,
            resultInterface,
            resultNetwork,
            existingInterface,
            existingNetwork,
            nicName,
          );

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
      };
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
