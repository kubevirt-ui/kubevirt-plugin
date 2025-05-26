import React from 'react';

import VirtualMachineCloneModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineCloneModel';
import VirtualMachineInstanceMigrationModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceMigrationModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import VirtualMachineSnapshotModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineSnapshotModel';
import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import CloneVMModal from '@kubevirt-utils/components/CloneVMModal/CloneVMModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SnapshotModal from '@kubevirt-utils/components/SnapshotModal/SnapshotModal';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DEFAULT_MIGRATION_NAMESPACE,
  MigMigration,
  MigMigrationModel,
} from '@kubevirt-utils/resources/migrations/constants';
import { asAccessReview, getNamespace } from '@kubevirt-utils/resources/shared';
import { getVMSSHSecretName } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Action, Patch } from '@openshift-console/dynamic-plugin-sdk';
import { CopyIcon } from '@patternfly/react-icons';
import { fleetPatchResource } from '@stolostron/multicluster-sdk';
import VirtualMachineMigrateModal from '@virtualmachines/actions/components/VirtualMachineMigration/VirtualMachineMigrationModal';
import { isDeletionProtectionEnabled } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

import MoveVMToFolderModal from '../../../utils/components/MoveVMToFolderModal/MoveVMToFolderModal';
import {
  isLiveMigratable,
  isRestoring,
  isRunning,
  isSnapshotting,
  printableVMStatus,
} from '../utils';

import ConfirmVMActionModal from './components/ConfirmVMActionModal/ConfirmVMActionModal';
import DeleteVMModal from './components/DeleteVMModal/DeleteVMModal';
import {
  cancelMigration,
  migrateVM,
  pauseVM,
  restartVM,
  startVM,
  stopVM,
  unpauseVM,
} from './actions';

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

export const VirtualMachineActionFactory = {
  cancelComputeMigration: (
    vm: V1VirtualMachine,
    vmim: V1VirtualMachineInstanceMigration,
  ): Action => {
    return {
      accessReview: {
        group: VirtualMachineInstanceMigrationModel.apiGroup,
        namespace: vm?.metadata?.namespace,
        resource: VirtualMachineInstanceMigrationModel.plural,
        verb: 'delete',
      },
      cta: () => cancelMigration(vmim),
      description: !!vmim?.metadata?.deletionTimestamp && t('Canceling ongoing migration'),
      disabled: !vmim || !!vmim?.metadata?.deletionTimestamp,
      id: 'vm-action-cancel-migrate',
      label: t('Cancel compute migration'),
    };
  },
  cancelStorageMigration: (currentStorageMigration: MigMigration): Action => {
    const canceled =
      currentStorageMigration?.spec?.rollback || currentStorageMigration?.spec?.canceled;

    const patch: Patch[] = [{ op: 'replace', path: '/spec/rollback', value: true }];

    if (currentStorageMigration?.spec?.migrateState)
      patch.push({ op: 'remove', path: '/spec/migrateState' });

    return {
      accessReview: {
        group: MigMigrationModel.apiGroup,
        namespace: DEFAULT_MIGRATION_NAMESPACE,
        resource: MigMigrationModel.plural,
        verb: 'patch',
      },
      cta: () =>
        k8sPatch({
          data: patch,
          model: MigMigrationModel,
          resource: currentStorageMigration,
        }),
      disabled: canceled,
      id: 'vm-action-cancel-storage-migrate',
      label: canceled ? t('Cancelling storage migration') : t('Cancel storage migration'),
    };
  },
  clone: (vm: V1VirtualMachine, createModal: (modal: ModalComponent) => void): Action => {
    return {
      accessReview: asAccessReview(VirtualMachineCloneModel, vm, 'create'),
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <CloneVMModal isOpen={isOpen} onClose={onClose} source={vm} />
        )),
      disabledTooltip: t(`You don't have permission to perform this action`),
      id: 'vm-action-clone',
      label: t('Clone'),
    };
  },
  copySSHCommand: (vm: V1VirtualMachine, command: string): Action => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
      cta: () => command && navigator.clipboard.writeText(command),
      description: t('SSH using virtctl'),
      disabled: isEmpty(getVMSSHSecretName(vm)),
      icon: <CopyIcon />,
      id: 'vm-action-copy-ssh',
      label: t('Copy SSH command'),
    };
  },
  delete: (vm: V1VirtualMachine, createModal: (modal: ModalComponent) => void): Action => {
    return {
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
      id: 'vm-action-delete',
      label: t('Delete'),
    };
  },
  editLabels: (vm: V1VirtualMachine, createModal: (modal: ModalComponent) => void): Action => ({
    accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
    cta: () =>
      createModal(({ isOpen, onClose }) => (
        <LabelsModal
          onLabelsSubmit={(labels) =>
            k8sPatch({
              data: [
                {
                  op: 'replace',
                  path: '/metadata/labels',
                  value: labels,
                },
              ],
              model: VirtualMachineModel,
              resource: vm,
            })
          }
          isOpen={isOpen}
          obj={vm}
          onClose={onClose}
        />
      )),
    id: 'vm-action-edit-labels',
    label: t('Edit labels'),
  }),
  forceStop: (vm: V1VirtualMachine): Action => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
      cta: () =>
        stopVM(vm, {
          gracePeriod: 0,
        }),
      disabled: [Migrating, Provisioning, Stopped, Unknown].includes(vm?.status?.printableStatus),
      id: 'vm-action-force-stop',
      label: t('Force stop'),
    };
  },
  migrateCompute: (vm: V1VirtualMachine): Action => {
    return {
      accessReview: {
        group: VirtualMachineInstanceMigrationModel.apiGroup,
        namespace: vm?.metadata?.namespace,
        resource: VirtualMachineInstanceMigrationModel.plural,
        verb: 'create',
      },
      cta: () => migrateVM(vm),
      description: t('Migrate VirtualMachine to a different Node'),
      disabled: !isLiveMigratable(vm),
      id: 'vm-action-migrate',
      label: t('Compute'),
    };
  },
  migrateStorage: (vm: V1VirtualMachine, createModal: (modal: ModalComponent) => void): Action => {
    return {
      accessReview: {
        group: VirtualMachineModel.apiGroup,
        namespace: getNamespace(vm),
        resource: VirtualMachineModel.plural,
        verb: 'patch',
      },
      cta: () => createModal((props) => <VirtualMachineMigrateModal vms={[vm]} {...props} />),
      description: t('Migrate VirtualMachine storage to a different StorageClass'),
      id: 'vm-migrate-storage',
      label: t('Storage'),
    };
  },
  migrationActions: (migrationActions): ActionDropdownItemType => ({
    cta: () => null, // Required to avoid breaking actions in the topology view
    id: 'migration-menu',
    label: 'Migration',
    options: migrationActions,
  }),
  moveToFolder: (vm: V1VirtualMachine, createModal: (modal: ModalComponent) => void): Action => {
    return {
      accessReview: {
        group: VirtualMachineModel.apiGroup,
        namespace: getNamespace(vm),
        resource: VirtualMachineModel.plural,
        verb: 'patch',
      },
      cta: () =>
        createModal((props) => (
          <MoveVMToFolderModal
            onSubmit={(folderName) => {
              const labels = vm?.metadata?.labels || {};
              labels[VM_FOLDER_LABEL] = folderName;
              return fleetPatchResource({
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
            }}
            vm={vm}
            {...props}
          />
        )),
      id: 'vm-action-move-to-folder',
      label: t('Move to folder'),
    };
  },
  pause: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
    confirmVMActions: boolean,
  ): Action => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
      cta: () =>
        confirmVMActions
          ? createModal(({ isOpen, onClose }) => (
              <ConfirmVMActionModal
                action={pauseVM}
                actionType="Pause"
                isOpen={isOpen}
                onClose={onClose}
                vm={vm}
              />
            ))
          : pauseVM(vm),
      disabled: vm?.status?.printableStatus !== Running || isSnapshotting(vm) || isRestoring(vm),
      id: 'vm-action-pause',
      label: t('Pause'),
    };
  },
  restart: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
    confirmVMActions: boolean,
  ): Action => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
      cta: () =>
        confirmVMActions
          ? createModal(({ isOpen, onClose }) => (
              <ConfirmVMActionModal
                action={restartVM}
                actionType="Restart"
                isOpen={isOpen}
                onClose={onClose}
                vm={vm}
              />
            ))
          : restartVM(vm),
      disabled:
        [Migrating, Provisioning, Stopped, Stopping, Terminating, Unknown].includes(
          vm?.status?.printableStatus,
        ) ||
        isSnapshotting(vm) ||
        isRestoring(vm),
      id: 'vm-action-restart',
      label: t('Restart'),
    };
  },
  snapshot: (vm: V1VirtualMachine, createModal: (modal: ModalComponent) => void): Action => {
    return {
      accessReview: asAccessReview(VirtualMachineSnapshotModel, vm, 'create'),
      cta: () => createModal((props) => <SnapshotModal vm={vm} {...props} />),
      id: 'vm-action-snapshot',
      label: t('Take snapshot'),
    };
  },
  start: (vm: V1VirtualMachine): Action => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
      cta: () => startVM(vm),
      disabled:
        [
          Migrating,
          Paused,
          Provisioning,
          Running,
          Starting,
          Stopping,
          Terminating,
          Unknown,
        ].includes(vm?.status?.printableStatus) ||
        isSnapshotting(vm) ||
        isRestoring(vm),
      id: 'vm-action-start',
      label: t('Start'),
    };
  },
  stop: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
    confirmVMActions: boolean,
  ): Action => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
      cta: () =>
        confirmVMActions
          ? createModal(({ isOpen, onClose }) => (
              <ConfirmVMActionModal
                action={stopVM}
                actionType="Stop"
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
      id: 'vm-action-stop',
      label: t('Stop'),
    };
  },
  unpause: (vm: V1VirtualMachine): Action => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
      cta: () => unpauseVM(vm),
      disabled: vm?.status?.printableStatus !== Paused,
      id: 'vm-action-unpause',
      label: t('Unpause'),
    };
  },
};
