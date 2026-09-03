// Extracted from VirtualMachineActionFactory.tsx
// Root: src/views/virtualmachines/actions/VirtualMachineActionFactory.tsx

import React from 'react';
import { type TFunction } from 'i18next';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { type ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { VirtualMachineSubresourcesModel } from '@kubevirt-utils/models';
import { asAccessReview } from '@kubevirt-utils/resources/shared';

import { isRestoring, isSnapshotting, printableVMStatus } from '../utils';

import { startVM, stopVM } from './actions';
import ConfirmVMActionModal from './components/ConfirmVMActionModal/ConfirmVMActionModal';
import { VM_ACTIONS } from './components/ConfirmVMActionModal/constants';
import { ACTIONS_ID } from './hooks/constants';
import { type LifecycleActions } from './lifecycleActionTypes';

const {
  Migrating,
  Paused,
  Provisioning,
  Running,
  Starting,
  Stopped,
  Stopping,
  Terminating,
  Unknown,
} = printableVMStatus;

export const createLifecyclePowerActions = (
  t: TFunction,
): Pick<LifecycleActions, 'forceStop' | 'start' | 'stop'> => ({
  forceStop: (vm: V1VirtualMachine): ActionDropdownItemType => ({
    accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
    cta: () => stopVM(vm, { gracePeriod: 0 }),
    disabled: [Migrating, Provisioning, Stopped, Unknown].includes(vm?.status?.printableStatus),
    id: ACTIONS_ID.FORCE_STOP,
    label: t('Force stop'),
  }),
  start: (vm: V1VirtualMachine): ActionDropdownItemType => ({
    accessReview: asAccessReview(VirtualMachineSubresourcesModel, vm, 'update', 'start'),
    cta: () => startVM(vm),
    disabled:
      [Migrating, Paused, Provisioning, Running, Starting, Stopping, Terminating, Unknown].includes(
        vm?.status?.printableStatus,
      ) ||
      isSnapshotting(vm) ||
      isRestoring(vm),
    id: ACTIONS_ID.START,
    label: t('Start'),
  }),
  stop: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
    confirmVMActions: boolean,
  ): ActionDropdownItemType => ({
    accessReview: asAccessReview(VirtualMachineSubresourcesModel, vm, 'update', 'stop'),
    cta: () =>
      confirmVMActions
        ? createModal(({ isOpen, onClose }) => (
            <ConfirmVMActionModal
              action={stopVM}
              actionType={VM_ACTIONS.stop}
              isOpen={isOpen}
              onClose={onClose}
              vm={vm}
            />
          ))
        : stopVM(vm),
    disabled:
      [Provisioning, Stopped, Stopping, Terminating, Unknown].includes(
        vm?.status?.printableStatus,
      ) ||
      isSnapshotting(vm) ||
      isRestoring(vm),
    id: ACTIONS_ID.STOP,
    label: t('Stop'),
  }),
});
