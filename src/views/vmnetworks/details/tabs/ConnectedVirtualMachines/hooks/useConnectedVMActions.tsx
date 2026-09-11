import React, { useCallback } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModel } from '@kubevirt-utils/models';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { type Action } from '@openshift-console/dynamic-plugin-sdk';

import DisconnectVMModal from '../actions/components/DisconnectVMModal';
import MoveVMModal from '../actions/components/MoveVMModal';

const useConnectedVMActions = (
  vmNetworkName: string | undefined,
): ((vmList: V1VirtualMachine[]) => Action[]) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const createActions = useCallback(
    (vmList: V1VirtualMachine[]): Action[] => {
      const vm = vmList[0];
      const accessReview = vm ? asAccessReview(VirtualMachineModel, vm, 'patch') : undefined;

      return [
        {
          accessReview,
          cta: (): void =>
            createModal(({ onClose }) => (
              <DisconnectVMModal closeModal={onClose} currentNetwork={vmNetworkName} vms={vmList} />
            )),
          id: 'disconnect-vm',
          label: t('Disconnect virtual machine from network'),
        },
        {
          accessReview,
          cta: (): void =>
            createModal(({ onClose }) => (
              <MoveVMModal closeModal={onClose} currentNetwork={vmNetworkName} vms={vmList} />
            )),
          id: 'move-vm',
          label: t('Move virtual machine to another network'),
        },
      ];
    },
    [createModal, vmNetworkName, t],
  );

  return createActions;
};

export default useConnectedVMActions;
