import { type TFunction } from 'i18next';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { type ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import {
  VirtualMachineInstanceSubresourcesModel,
  VirtualMachineSubresourcesModel,
} from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { printableVMStatus } from '../utils';

import { asBulkAccessReview } from './accessReviewUtils';
import { pauseVM, resetVM, restartVM, startVM, stopVM, unpauseVM } from './actions';
import { createConfirmableBulkLifecycleCta } from './bulkLifecycleActionHelpers';
import { BULK_ACTIONS_ID } from './hooks/constants';

const { Paused, Stopped } = printableVMStatus;

export const createStartConfig =
  (t: TFunction) =>
  (vms: V1VirtualMachine[]): ActionDropdownItemType => ({
    accessReview: asBulkAccessReview(VirtualMachineSubresourcesModel, vms, 'update', 'start'),
    cta: (): void => {
      for (const vm of vms) void startVM(vm);
    },
    disabled: isEmpty(vms),
    id: BULK_ACTIONS_ID.START,
    label: t('Start'),
  });

export const createStopConfig =
  (t: TFunction) =>
  (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
    confirmVMActionsEnabled: boolean,
  ): ActionDropdownItemType => ({
    accessReview: asBulkAccessReview(VirtualMachineSubresourcesModel, vms, 'update', 'stop'),
    cta: createConfirmableBulkLifecycleCta({
      action: stopVM,
      actionType: 'Stop',
      confirmVMActionsEnabled,
      createModal,
      vms,
    }),
    disabled: isEmpty(vms),
    id: BULK_ACTIONS_ID.STOP,
    label: t('Stop'),
  });

export const createPauseConfig =
  (t: TFunction) =>
  (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
    confirmVMActionsEnabled: boolean,
  ): ActionDropdownItemType => ({
    accessReview: asBulkAccessReview(
      VirtualMachineInstanceSubresourcesModel,
      vms,
      'update',
      'pause',
    ),
    cta: createConfirmableBulkLifecycleCta({
      action: pauseVM,
      actionType: 'Pause',
      confirmVMActionsEnabled,
      createModal,
      vms,
    }),
    disabled: vms.every((vm) => vm.status?.printableStatus === Stopped),
    id: BULK_ACTIONS_ID.PAUSE,
    label: t('Pause'),
  });

export const createUnpauseConfig =
  (t: TFunction) =>
  (vms: V1VirtualMachine[]): ActionDropdownItemType => ({
    accessReview: asBulkAccessReview(
      VirtualMachineInstanceSubresourcesModel,
      vms,
      'update',
      'unpause',
    ),
    cta: (): void => {
      for (const vm of vms) void unpauseVM(vm);
    },
    disabled: isEmpty(vms) || !vms.every((vm) => vm.status?.printableStatus === Paused),
    id: BULK_ACTIONS_ID.UNPAUSE,
    label: t('Unpause'),
  });

export const createRestartConfig =
  (t: TFunction) =>
  (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
    confirmVMActionsEnabled: boolean,
  ): ActionDropdownItemType => ({
    accessReview: asBulkAccessReview(VirtualMachineSubresourcesModel, vms, 'update', 'restart'),
    cta: createConfirmableBulkLifecycleCta({
      action: restartVM,
      actionType: 'Restart',
      confirmVMActionsEnabled,
      createModal,
      vms,
    }),
    disabled: vms.every((vm) => vm.status?.printableStatus === Stopped),
    id: BULK_ACTIONS_ID.RESTART,
    label: t('Restart'),
  });

export const createResetConfig =
  (t: TFunction) =>
  (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
    confirmVMActionsEnabled: boolean,
  ): ActionDropdownItemType => ({
    accessReview: asBulkAccessReview(VirtualMachineModel, vms, 'patch'),
    cta: createConfirmableBulkLifecycleCta({
      action: resetVM,
      actionType: 'Reset',
      checkToConfirmMessage: t(
        'A VM reset is a hard power cycle and might cause data loss or corruption. Only reset if the VM is completely unresponsive.',
      ),
      confirmVMActionsEnabled,
      createModal,
      severityVariant: 'warning',
      vms,
    }),
    description: t('Hard power cycle on the VMs'),
    disabled: vms.every((vm) => vm.status?.printableStatus === Stopped),
    id: BULK_ACTIONS_ID.RESET,
    label: t('Reset'),
  });
