// Extracted from VirtualMachineActionFactory.tsx
// Root: src/views/virtualmachines/actions/VirtualMachineActionFactory.tsx

import React from 'react';
import { type TFunction } from 'i18next';

import {
  VirtualMachineCloneModel,
  VirtualMachineSnapshotModel,
  VirtualMachineTemplateRequestModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import CloneVMModal from '@kubevirt-utils/components/CloneVMModal/CloneVMModal';
import { type ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SaveAsTemplateModal from '@kubevirt-utils/components/SaveAsTemplateModal/SaveAsTemplateModal';
import SnapshotModal from '@kubevirt-utils/components/SnapshotModal/SnapshotModal';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { getMigratableVolumeSnapshotStatuses } from '@kubevirt-utils/resources/vm/utils/snapshotStatuses';
import { getNoPermissionTooltipContent } from '@kubevirt-utils/utils/utils';
import { isDeletionProtectionEnabled } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';

import { isRunning } from '../utils';

import DeleteVMModal from './components/DeleteVMModal/DeleteVMModal';
import { ACTIONS_ID } from './hooks/constants';

export type CloneDeleteActions = {
  clone: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ) => ActionDropdownItemType;
  delete: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ) => ActionDropdownItemType;
  saveAsTemplate: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ) => ActionDropdownItemType;
  snapshot: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ) => ActionDropdownItemType;
};

export const createCloneDeleteActions = (t: TFunction): CloneDeleteActions => ({
  clone: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => {
    const migratableDisks = getMigratableVolumeSnapshotStatuses(vm);
    const noMigratableDisks = migratableDisks?.length === 0;

    return {
      accessReview: asAccessReview(VirtualMachineCloneModel, vm, 'create'),
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <CloneVMModal isOpen={isOpen} onClose={onClose} source={vm} />
        )),
      description: noMigratableDisks && t('No migratable disks found'),
      disabled: noMigratableDisks,
      disabledTooltip: !noMigratableDisks && getNoPermissionTooltipContent(t),
      id: ACTIONS_ID.CLONE,
      label: t('Clone'),
    };
  },
  delete: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => ({
    accessReview: asAccessReview(VirtualMachineModel, vm, 'delete'),
    cta: () =>
      createModal(({ isOpen, onClose }) => (
        <DeleteVMModal isOpen={isOpen} onClose={onClose} vm={vm} />
      )),
    description: isRunning(vm) && t('The VirtualMachine is running'),
    disabled: isRunning(vm) || isDeletionProtectionEnabled(vm),
    disabledTooltip:
      !isRunning(vm) && isDeletionProtectionEnabled(vm)
        ? t(
            'VirtualMachine is delete protected and cannot be deleted. To enable deletion, go to VirtualMachine details and disable deletion protection.',
          )
        : undefined,
    id: ACTIONS_ID.DELETE,
    label: t('Delete'),
  }),
  saveAsTemplate: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => ({
    accessReview: asAccessReview(VirtualMachineTemplateRequestModel, vm, 'create'),
    cta: () =>
      createModal(({ isOpen, onClose }) => (
        <SaveAsTemplateModal isOpen={isOpen} onClose={onClose} vm={vm} />
      )),
    disabledTooltip: getNoPermissionTooltipContent(t),
    id: ACTIONS_ID.SAVE_AS_TEMPLATE,
    label: t('Save as template'),
  }),
  snapshot: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => ({
    accessReview: asAccessReview(VirtualMachineSnapshotModel, vm, 'create'),
    cta: () => createModal((props) => <SnapshotModal vm={vm} {...props} />),
    id: ACTIONS_ID.SNAPSHOT,
    label: t('Take snapshot'),
  }),
});
