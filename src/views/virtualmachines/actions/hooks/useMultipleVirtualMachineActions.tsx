import React, { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { CONFIRM_VM_ACTIONS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import ConfirmMultipleVMActionsModal from '@virtualmachines/actions/components/ConfirmMultipleVMActionsModal/ConfirmMultipleVMActionsModal';
import { isPaused, isRunning, isStopped } from '@virtualmachines/utils';

import { pauseVM, restartVM, startVM, stopVM, unpauseVM } from '../actions';

import { ACTIONS_ID } from './constants';

type UseMultipleVirtualMachineActions = (vms: V1VirtualMachine[]) => ActionDropdownItemType[];

const useMultipleVirtualMachineActions: UseMultipleVirtualMachineActions = (vms) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { featureEnabled: confirmVMActionsEnabled } = useFeatures(CONFIRM_VM_ACTIONS);

  return useMemo(() => {
    const actions: ActionDropdownItemType[] = [
      {
        cta: () => vms.forEach(startVM),
        id: ACTIONS_ID.START,
        label: t('Start'),
      },
      {
        cta: () =>
          confirmVMActionsEnabled
            ? createModal(({ isOpen, onClose }) => (
                <ConfirmMultipleVMActionsModal
                  action={restartVM}
                  actionType="Restart"
                  isOpen={isOpen}
                  onClose={onClose}
                  vms={vms}
                />
              ))
            : vms.forEach(restartVM),
        id: ACTIONS_ID.RESTART,
        label: t('Restart'),
      },
      {
        cta: () => {
          confirmVMActionsEnabled
            ? createModal(({ isOpen, onClose }) => (
                <ConfirmMultipleVMActionsModal
                  action={stopVM}
                  actionType="Stop"
                  isOpen={isOpen}
                  onClose={onClose}
                  vms={vms}
                />
              ))
            : vms.forEach((vm) => stopVM(vm));
        },
        id: ACTIONS_ID.STOP,
        label: t('Stop'),
      },
      {
        cta: () =>
          confirmVMActionsEnabled
            ? createModal(({ isOpen, onClose }) => (
                <ConfirmMultipleVMActionsModal
                  action={pauseVM}
                  actionType="Pause"
                  isOpen={isOpen}
                  onClose={onClose}
                  vms={vms}
                />
              ))
            : vms.forEach(pauseVM),
        id: ACTIONS_ID.PAUSE,
        label: t('Pause'),
      },
      {
        cta: () => vms.forEach(unpauseVM),
        id: ACTIONS_ID.UNPAUSE,
        label: t('Unpause'),
      },
    ];

    if (vms.every(isStopped)) {
      return actions.filter((action) => action.id !== ACTIONS_ID.STOP);
    }

    if (vms.every(isRunning)) {
      return actions.filter((action) => action.id !== ACTIONS_ID.START);
    }

    if (vms.every(isPaused)) {
      return actions.filter((action) => action.id !== ACTIONS_ID.PAUSE);
    }

    return actions;
  }, [t, vms]);
};

export default useMultipleVirtualMachineActions;
