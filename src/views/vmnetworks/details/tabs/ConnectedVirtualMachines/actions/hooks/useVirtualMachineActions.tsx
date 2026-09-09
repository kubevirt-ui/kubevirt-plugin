import React, { useMemo } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModel } from '@kubevirt-utils/models';
import { asAccessReview, getName } from '@kubevirt-utils/resources/shared';
import { type ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { type Action } from '@openshift-console/dynamic-plugin-sdk';

import DisconnectVMModal from '../components/DisconnectVMModal';
import MoveVMModal from '../components/MoveVMModal';

type UseVirtualMachineActions = (
  vms: V1VirtualMachine[],
  vmNetwork: ClusterUserDefinedNetworkKind,
) => Action[];

const useVirtualMachineActions: UseVirtualMachineActions = (vms, vmNetwork) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const isSingleVM = vms.length === 1;
  const vm = vms[0];

  const vmNetworkName = getName(vmNetwork);

  const actions = useMemo(
    (): Action[] => [
      {
        accessReview: isSingleVM ? asAccessReview(VirtualMachineModel, vm, 'patch') : undefined,
        cta: (): void =>
          createModal(({ onClose }) => (
            <DisconnectVMModal closeModal={onClose} currentNetwork={vmNetworkName} vms={vms} />
          )),
        id: 'disconnect-vm',
        label: t('Disconnect virtual machine from network'),
      },
      {
        accessReview: isSingleVM ? asAccessReview(VirtualMachineModel, vm, 'patch') : undefined,
        cta: (): void =>
          createModal(({ onClose }) => (
            <MoveVMModal closeModal={onClose} currentNetwork={vmNetworkName} vms={vms} />
          )),
        id: 'move-vm',
        label: t('Move virtual machine to another network'),
      },
    ],
    [vm, vmNetworkName, t, createModal, isSingleVM, vms],
  );

  return actions;
};

export default useVirtualMachineActions;
