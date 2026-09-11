// Extracted from VirtualMachineActionFactory.tsx
// Root: src/views/virtualmachines/actions/VirtualMachineActionFactory.tsx

import { type TFunction } from 'i18next';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { type ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import {
  VirtualMachineInstanceSubresourcesModel,
  VirtualMachineSubresourcesModel,
} from '@kubevirt-utils/models';
import { asAccessReview } from '@kubevirt-utils/resources/shared';

import { isRestoring, isRunning, isSnapshotting, printableVMStatus } from '../utils';

import { pauseVM, resetVM, restartVM, unpauseVM } from './actions';
import ConfirmVMActionModal from './components/ConfirmVMActionModal/ConfirmVMActionModal';
import { VM_ACTIONS } from './components/ConfirmVMActionModal/constants';
import { ACTIONS_ID } from './hooks/constants';
import { type LifecycleActions } from './lifecycleActionTypes';

const { Migrating, Paused, Provisioning, Stopped, Stopping, Terminating, Unknown } =
  printableVMStatus;

export const createLifecyclePauseResetActions = (
  t: TFunction,
): Pick<LifecycleActions, 'pause' | 'reset' | 'restart' | 'unpause'> => ({
  pause: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
    confirmVMActions: boolean,
  ): ActionDropdownItemType => ({
    accessReview: asAccessReview(VirtualMachineInstanceSubresourcesModel, vm, 'update', 'pause'),
    cta: () =>
      confirmVMActions
        ? createModal(({ isOpen, onClose }) => (
            <ConfirmVMActionModal
              action={pauseVM}
              actionType={VM_ACTIONS.pause}
              isOpen={isOpen}
              onClose={onClose}
              vm={vm}
            />
          ))
        : pauseVM(vm),
    disabled: !isRunning(vm) || isSnapshotting(vm) || isRestoring(vm),
    id: ACTIONS_ID.PAUSE,
    label: t('Pause'),
  }),
  reset: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
    confirmVMActions: boolean,
  ): ActionDropdownItemType => ({
    accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
    cta: () =>
      confirmVMActions
        ? createModal(({ isOpen, onClose }) => (
            <ConfirmVMActionModal
              action={resetVM}
              actionType={VM_ACTIONS.reset}
              checkToConfirmMessage={t(
                'A VM reset is a hard power cycle and might cause data loss or corruption. Only reset if the VM is completely unresponsive.',
              )}
              isOpen={isOpen}
              onClose={onClose}
              severityVariant="warning"
              vm={vm}
            />
          ))
        : resetVM(vm),
    description: t('Hard power cycle on the VM'),
    disabled: !isRunning(vm) || isSnapshotting(vm) || isRestoring(vm),
    id: ACTIONS_ID.RESET,
    label: t('Reset'),
  }),
  restart: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
    confirmVMActions: boolean,
  ): ActionDropdownItemType => ({
    accessReview: asAccessReview(VirtualMachineSubresourcesModel, vm, 'update', 'restart'),
    cta: () =>
      confirmVMActions
        ? createModal(({ isOpen, onClose }) => (
            <ConfirmVMActionModal
              action={restartVM}
              actionType={VM_ACTIONS.restart}
              isOpen={isOpen}
              onClose={onClose}
              vm={vm}
            />
          ))
        : restartVM(vm),
    description: t('Shut down and reboot the VM'),
    disabled:
      [Migrating, Provisioning, Stopped, Stopping, Terminating, Unknown].includes(
        vm?.status?.printableStatus,
      ) ||
      isSnapshotting(vm) ||
      isRestoring(vm),
    id: ACTIONS_ID.RESTART,
    label: t('Restart'),
  }),
  unpause: (vm: V1VirtualMachine): ActionDropdownItemType => ({
    accessReview: asAccessReview(VirtualMachineInstanceSubresourcesModel, vm, 'update', 'unpause'),
    cta: () => unpauseVM(vm),
    disabled: vm?.status?.printableStatus !== Paused,
    id: ACTIONS_ID.UNPAUSE,
    label: t('Unpause'),
  }),
});
