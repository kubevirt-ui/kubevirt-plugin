import React from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MoveBulkVMToFolderModal from '@kubevirt-utils/components/MoveVMToFolderModal/MoveBulkVMsToFolderModal';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabels, getNamespace } from '@kubevirt-utils/resources/shared';
import { Action, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

import ConfirmMultipleVMActionsModal from './components/ConfirmMultipleVMActionsModal/ConfirmMultipleVMActionsModal';
import VirtualMachineMigrateModal from './components/VirtualMachineMigration/VirtualMachineMigrationModal';
import { ACTIONS_ID } from './hooks/constants';
import { deleteVM, pauseVM, restartVM, startVM, stopVM, unpauseVM } from './actions';
import { getCommonLabels, getLabelsDiffPatch, isSameNamespace } from './utils';

export const BulkVirtualMachineActionFactory = {
  delete: (vms: V1VirtualMachine[], createModal: (modal: ModalComponent) => void): Action => ({
    cta: () =>
      createModal(({ isOpen, onClose }) => (
        <ConfirmMultipleVMActionsModal
          action={deleteVM}
          actionType="Delete"
          isOpen={isOpen}
          onClose={onClose}
          vms={vms}
        />
      )),
    id: ACTIONS_ID.DELETE,
    label: t('Delete'),
  }),
  editLabel: (vms: V1VirtualMachine[], createModal: (modal: ModalComponent) => void): Action => ({
    cta: () => {
      const commonLabels = getCommonLabels(vms);

      createModal(({ isOpen, onClose }) => (
        <LabelsModal
          onLabelsSubmit={(labels) => {
            return Promise.all(
              vms.map((vm) =>
                k8sPatch<V1VirtualMachine>({
                  data: getLabelsDiffPatch(labels, getLabels(vm)),
                  model: VirtualMachineModel,
                  resource: vm,
                }),
              ),
            );
          }}
          initialLabels={commonLabels}
          isOpen={isOpen}
          obj={vms?.[0]}
          onClose={onClose}
        />
      ));
    },
    id: ACTIONS_ID.EDIT_LABELS,
    label: t('Edit labels'),
  }),
  migrateStorage: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
  ): Action => ({
    accessReview: {
      group: VirtualMachineModel.apiGroup,
      namespace: getNamespace(vms?.[0]),
      resource: VirtualMachineModel.plural,
      verb: 'patch',
    },
    cta: () => createModal((props) => <VirtualMachineMigrateModal vms={vms} {...props} />),
    description: t('Migrate VirtualMachine storage to a different StorageClass'),
    id: 'vms-bulk-migrate-storage',
    label: t('Migrate storage'),
  }),

  moveToFolder: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
  ): Action => ({
    cta: () =>
      createModal(({ isOpen, onClose }) => (
        <MoveBulkVMToFolderModal
          onSubmit={(folderName) => {
            return Promise.all(
              vms.map((vm) => {
                const labels = vm?.metadata?.labels || {};
                labels[VM_FOLDER_LABEL] = folderName;
                return k8sPatch<V1VirtualMachine>({
                  data: [
                    {
                      op: 'replace',
                      path: '/metadata/labels',
                      value: labels,
                    },
                  ],
                  model: VirtualMachineModel,
                  resource: vm,
                });
              }),
            );
          }}
          isOpen={isOpen}
          onClose={onClose}
          vms={vms}
        />
      )),
    disabled: !isSameNamespace(vms),
    id: ACTIONS_ID.MOVE_TO_FOLDER,
    label: t('Move to folder'),
  }),
  pause: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
    confirmVMActionsEnabled: boolean,
  ): Action => ({
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
  }),
  restart: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
    confirmVMActionsEnabled: boolean,
  ): Action => ({
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
  }),
  start: (vms: V1VirtualMachine[]): Action => ({
    cta: () => vms.forEach(startVM),
    id: ACTIONS_ID.START,
    label: t('Start'),
  }),
  stop: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
    confirmVMActionsEnabled: boolean,
  ): Action => ({
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
  }),
  unpause: (vms: V1VirtualMachine[]): Action => ({
    cta: () => vms.forEach(unpauseVM),
    id: ACTIONS_ID.UNPAUSE,
    label: t('Unpause'),
  }),
};
