import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModel } from '@kubevirt-utils/models';
import { asAccessReview, getName } from '@kubevirt-utils/resources/shared';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { Action, useModal } from '@openshift-console/dynamic-plugin-sdk';

import DisconnectVMModal, { DisconnectVMModalProps } from '../components/DisconnectVMModal';
import MoveVMModal, { MoveVMModalProps } from '../components/MoveVMModal';

type UseVirtualMachineActions = (
  vms: V1VirtualMachine[],
  vmNetwork: ClusterUserDefinedNetworkKind,
) => Action[];

const useVirtualMachineActions: UseVirtualMachineActions = (vms, vmNetwork) => {
  const { t } = useKubevirtTranslation();
  const createModal = useModal();

  const isSingleVM = vms.length === 1;
  const vm = vms[0];

  const vmNetworkName = getName(vmNetwork);

  const actions = useMemo(
    (): Action[] => [
      {
        accessReview: isSingleVM ? asAccessReview(VirtualMachineModel, vm, 'patch') : undefined,
        cta: () =>
          createModal<DisconnectVMModalProps>(DisconnectVMModal, {
            currentNetwork: vmNetworkName,
            vms,
          }),
        id: 'disconnect-vm',
        label: t('Disconnect virtual machine from network'),
      },
      {
        accessReview: isSingleVM ? asAccessReview(VirtualMachineModel, vm, 'patch') : undefined,
        cta: () =>
          createModal<MoveVMModalProps>(MoveVMModal, {
            currentNetwork: vmNetworkName,
            vms,
          }),
        id: 'move-vm',
        label: t('Move virtual machine to another network'),
      },
    ],
    [vm, vmNetworkName, t, createModal, isSingleVM, vms],
  );

  return actions;
};

export default useVirtualMachineActions;
