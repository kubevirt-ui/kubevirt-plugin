import React from 'react';
import { TFunction } from 'react-i18next';

import { VirtualMachineInstanceMigrationModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MoveBulkVMToFolderModal from '@kubevirt-utils/components/MoveVMToFolderModal/MoveBulkVMsToFolderModal';
import BulkSnapshotModal from '@kubevirt-utils/components/SnapshotModal/BulkSnapshotModal';
import SnapshotModal from '@kubevirt-utils/components/SnapshotModal/SnapshotModal';
import {
  getLabels,
  getNamespace,
  haveSameCluster,
  haveSameNamespace,
} from '@kubevirt-utils/resources/shared';
import { getNoPermissionTooltipContent } from '@kubevirt-utils/utils/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import CrossClusterMigration from '@multicluster/components/CrossClusterMigration/CrossClusterMigration';
import { CROSS_CLUSTER_MIGRATION_ACTION_ID } from '@multicluster/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

import { isLiveMigratable, isRunning, printableVMStatus } from '../utils';

import ConfirmMultipleVMActionsModal from './components/ConfirmMultipleVMActionsModal/ConfirmMultipleVMActionsModal';
import VirtualMachineMigrateModal from './components/VirtualMachineMigration/VirtualMachineMigrationModal';
import { ACTIONS_ID } from './hooks/constants';
import {
  deleteVM,
  migrateVM,
  pauseVM,
  resetVM,
  restartVM,
  startVM,
  stopVM,
  unpauseVM,
} from './actions';
import { BulkVirtualMachineActionFactory } from './types';
import { getCommonLabels, getLabelsDiffPatch } from './utils';

const { Paused, Stopped } = printableVMStatus;

export const createBulkVirtualMachineActionFactory = (
  t: TFunction,
): BulkVirtualMachineActionFactory => ({
  controlActions: (controlActions: ActionDropdownItemType[]): ActionDropdownItemType => ({
    cta: null,
    id: 'control-menu',
    label: t('Control'),
    options: controlActions,
  }),
  crossClusterMigration: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
    isDisabled: boolean,
  ): ActionDropdownItemType => {
    const allRunning = vms?.every(isRunning);

    return {
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <CrossClusterMigration close={onClose} isOpen={isOpen} resources={vms} />
        )),
      disabled: isEmpty(vms) || isDisabled || !allRunning,
      disabledTooltip: !allRunning
        ? t('All VirtualMachines must be running')
        : t('Cross-cluster migration is not supported on this cluster.'),

      id: CROSS_CLUSTER_MIGRATION_ACTION_ID,
      label: t('Cross-cluster migration'),
    };
  },
  delete: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
    isDisabled: boolean,
  ): ActionDropdownItemType => ({
    cta: () =>
      createModal(({ isOpen, onClose }) => (
        <ConfirmMultipleVMActionsModal
          action={deleteVM}
          actionType="Delete"
          isOpen={isOpen}
          onClose={onClose}
          severityVariant="danger"
          vms={vms}
        />
      )),
    disabled: isEmpty(vms) || isDisabled,
    id: ACTIONS_ID.DELETE,
    label: t('Delete'),
  }),
  editLabels: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => ({
    cta: () => {
      const commonLabels = getCommonLabels(vms);

      createModal(({ isOpen, onClose }) => (
        <LabelsModal
          onLabelsSubmit={(newLabels) => {
            return Promise.all(
              vms.map((vm) =>
                kubevirtK8sPatch<V1VirtualMachine>({
                  data: getLabelsDiffPatch(newLabels, commonLabels, getLabels(vm)),
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
    disabled: isEmpty(vms),
    id: ACTIONS_ID.EDIT_LABELS,
    label: t('Edit labels'),
  }),
  migrateCompute: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => {
    const migratableVMs = vms?.filter(isLiveMigratable) || [];
    const nonMigratableVMs = vms?.filter((vm) => !isLiveMigratable(vm)) || [];
    const hasNoMigratableVMs = isEmpty(migratableVMs);

    return {
      accessReview: {
        cluster: getCluster(vms?.[0]),
        group: VirtualMachineInstanceMigrationModel.apiGroup,
        namespace: getNamespace(vms?.[0]),
        resource: VirtualMachineInstanceMigrationModel.plural,
        verb: 'create',
      },
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <ConfirmMultipleVMActionsModal
            excludedVMsReason={
              nonMigratableVMs.length > 1
                ? t('are not eligible for live migration and will not be migrated.')
                : t('is not eligible for live migration and will not be migrated.')
            }
            action={migrateVM}
            actionType="Migrate"
            excludedVMs={!isEmpty(nonMigratableVMs) ? nonMigratableVMs : undefined}
            includedVMsDescription={t('will be migrated.')}
            isOpen={isOpen}
            onClose={onClose}
            vms={migratableVMs}
          />
        )),
      description: t('Migrate VirtualMachines to a different Node'),
      disabled: hasNoMigratableVMs,
      disabledTooltip: hasNoMigratableVMs
        ? t('None of the selected VirtualMachines are eligible for live migration')
        : getNoPermissionTooltipContent(t),
      id: ACTIONS_ID.BULK_MIGRATE_COMPUTE,
      label: t('Compute'),
    };
  },

  migrateStorage: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => ({
    accessReview: {
      group: VirtualMachineModel.apiGroup,
      namespace: getNamespace(vms?.[0]),
      resource: VirtualMachineModel.plural,
      verb: 'patch',
    },
    cta: () => createModal((props) => <VirtualMachineMigrateModal vms={vms} {...props} />),
    description: t('Migrate VirtualMachine storage to a different StorageClass'),
    disabledTooltip: getNoPermissionTooltipContent(t),
    id: ACTIONS_ID.BULK_MIGRATE_STORAGE,
    label: t('Storage'),
  }),
  moveToFolder: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => ({
    cta: () =>
      createModal(({ isOpen, onClose }) => (
        <MoveBulkVMToFolderModal
          onSubmit={(folderName) => {
            return Promise.all(
              vms.map((vm) => {
                const labels = vm?.metadata?.labels || {};
                labels[VM_FOLDER_LABEL] = folderName;
                return kubevirtK8sPatch<V1VirtualMachine>({
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
    disabled: !haveSameCluster(vms) || !haveSameNamespace(vms) || isEmpty(vms),
    id: ACTIONS_ID.MOVE_TO_FOLDER,
    label: t('Move to folder'),
  }),
  pause: (
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
        : vms.forEach(pauseVM),
    disabled: vms.every((vm) => vm.status?.printableStatus === Stopped),
    id: ACTIONS_ID.PAUSE,
    label: t('Pause'),
  }),
  reset: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
    confirmVMActionsEnabled: boolean,
  ): ActionDropdownItemType => ({
    cta: () =>
      confirmVMActionsEnabled
        ? createModal(({ isOpen, onClose }) => (
            <ConfirmMultipleVMActionsModal
              checkToConfirmMessage={t(
                'A VM reset is a hard power cycle and might cause data loss or corruption. Only reset if the VM is completely unresponsive.',
              )}
              action={resetVM}
              actionType="Reset"
              isOpen={isOpen}
              onClose={onClose}
              severityVariant="warning"
              vms={vms}
            />
          ))
        : vms.forEach(resetVM),
    description: t('Hard power cycle on the VMs'),
    disabled: vms.every((vm) => vm.status?.printableStatus === Stopped),
    id: ACTIONS_ID.RESET,
    label: t('Reset'),
  }),
  restart: (
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
        : vms.forEach(restartVM),
    disabled: vms.every((vm) => vm.status?.printableStatus === Stopped),
    id: ACTIONS_ID.RESTART,
    label: t('Restart'),
  }),
  snapshot: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => ({
    cta: () =>
      createModal((props) =>
        vms.length === 1 ? (
          <SnapshotModal vm={vms[0]} {...props} />
        ) : (
          <BulkSnapshotModal vms={vms} {...props} />
        ),
      ),
    disabled: vms.every((vm) => vm.status?.printableStatus === Stopped),
    id: ACTIONS_ID.SNAPSHOT,
    label: t('Take snapshot'),
  }),
  start: (vms: V1VirtualMachine[]): ActionDropdownItemType => ({
    cta: () => vms.forEach(startVM),
    disabled: isEmpty(vms),
    id: ACTIONS_ID.START,
    label: t('Start'),
  }),
  stop: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
    confirmVMActionsEnabled: boolean,
  ): ActionDropdownItemType => ({
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
    disabled: isEmpty(vms),
    id: ACTIONS_ID.STOP,
    label: t('Stop'),
  }),
  unpause: (vms: V1VirtualMachine[]): ActionDropdownItemType => ({
    cta: () => vms.forEach(unpauseVM),
    disabled: !vms.every((vm) => vm.status?.printableStatus === Paused),
    id: ACTIONS_ID.UNPAUSE,
    label: t('Unpause'),
  }),
});
