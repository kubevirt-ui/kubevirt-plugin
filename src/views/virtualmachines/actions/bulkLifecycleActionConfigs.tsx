import React from 'react';
import { type TFunction } from 'i18next';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { type ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { printableVMStatus } from '../utils';

import { pauseVM, resetVM, restartVM, startVM, stopVM, unpauseVM } from './actions';
import ConfirmMultipleVMActionsModal from './components/ConfirmMultipleVMActionsModal/ConfirmMultipleVMActionsModal';
import { BULK_ACTIONS_ID } from './hooks/constants';

const { Paused, Stopped } = printableVMStatus;

export const createStartConfig =
  (t: TFunction) =>
  (vms: V1VirtualMachine[]): ActionDropdownItemType => ({
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
    cta: (): void => {
      // eslint-disable-next-line -- sonarjs/no-selector-parameter
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
        : ((): void => {
            for (const vm of vms) void stopVM(vm);
          })();
    },
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
        : ((): void => {
            for (const vm of vms) void pauseVM(vm);
          })(),
    disabled: vms.every((vm) => vm.status?.printableStatus === Stopped),
    id: BULK_ACTIONS_ID.PAUSE,
    label: t('Pause'),
  });

export const createUnpauseConfig =
  (t: TFunction) =>
  (vms: V1VirtualMachine[]): ActionDropdownItemType => ({
    cta: (): void => {
      for (const vm of vms) void unpauseVM(vm);
    },
    disabled: !vms.every((vm) => vm.status?.printableStatus === Paused),
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
        : ((): void => {
            for (const vm of vms) void restartVM(vm);
          })(),
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
    cta: () =>
      confirmVMActionsEnabled
        ? createModal(({ isOpen, onClose }) => (
            <ConfirmMultipleVMActionsModal
              action={resetVM}
              actionType="Reset"
              checkToConfirmMessage={t(
                'A VM reset is a hard power cycle and might cause data loss or corruption. Only reset if the VM is completely unresponsive.',
              )}
              isOpen={isOpen}
              onClose={onClose}
              severityVariant="warning"
              vms={vms}
            />
          ))
        : ((): void => {
            for (const vm of vms) void resetVM(vm);
          })(),
    description: t('Hard power cycle on the VMs'),
    disabled: vms.every((vm) => vm.status?.printableStatus === Stopped),
    id: BULK_ACTIONS_ID.RESET,
    label: t('Reset'),
  });
