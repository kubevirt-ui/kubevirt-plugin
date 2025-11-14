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
import { asAccessReview, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getVMSSHSecretName } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { getConsoleStandaloneURL } from '@multicluster/urls';
import { Patch } from '@openshift-console/dynamic-plugin-sdk';
import { CopyIcon } from '@patternfly/react-icons';
import ComputeMigrationModal from '@virtualmachines/actions/components/VirtualMachineComputeMigration/ComputeMigrationModal';
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
  pauseVM,
  resetVM,
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
  ): ActionDropdownItemType => {
    return {
      accessReview: {
        cluster: getCluster(vm),
        group: VirtualMachineInstanceMigrationModel.apiGroup,
        namespace: getNamespace(vm),
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
  cancelStorageMigration: (currentStorageMigration: MigMigration): ActionDropdownItemType => {
    const canceled =
      currentStorageMigration?.spec?.rollback || currentStorageMigration?.spec?.canceled;

    const patch: Patch[] = [{ op: 'replace', path: '/spec/rollback', value: true }];

    if (currentStorageMigration?.spec?.migrateState)
      patch.push({ op: 'remove', path: '/spec/migrateState' });

    return {
      accessReview: {
        cluster: getCluster(currentStorageMigration),
        group: MigMigrationModel.apiGroup,
        namespace: DEFAULT_MIGRATION_NAMESPACE,
        resource: MigMigrationModel.plural,
        verb: 'patch',
      },
      cta: () =>
        kubevirtK8sPatch({
          data: patch,
          model: MigMigrationModel,
          resource: currentStorageMigration,
        }),
      disabled: canceled,
      id: 'vm-action-cancel-storage-migrate',
      label: canceled ? t('Cancelling storage migration') : t('Cancel storage migration'),
    };
  },
  clone: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => {
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
  controlActions: (controlActions: ActionDropdownItemType[]): ActionDropdownItemType => ({
    cta: () => null, // follow migrationActions
    id: 'control-menu',
    label: t('Control'),
    options: controlActions,
  }),
  copySSHCommand: (vm: V1VirtualMachine, command: string): ActionDropdownItemType => {
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
  delete: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => {
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
  editLabels: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => ({
    accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
    cta: () =>
      createModal(({ isOpen, onClose }) => (
        <LabelsModal
          onLabelsSubmit={(labels) =>
            kubevirtK8sPatch({
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
  forceStop: (vm: V1VirtualMachine): ActionDropdownItemType => {
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
  migrateCompute: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => {
    return {
      accessReview: {
        cluster: getCluster(vm),
        group: VirtualMachineInstanceMigrationModel.apiGroup,
        namespace: vm?.metadata?.namespace,
        resource: VirtualMachineInstanceMigrationModel.plural,
        verb: 'create',
      },
      cta: () => createModal((props) => <ComputeMigrationModal {...props} vm={vm} />),
      description: t('Migrate VirtualMachine to a different Node'),
      disabled: !isLiveMigratable(vm),
      id: 'vm-action-migrate',
      label: t('Compute'),
    };
  },
  migrateStorage: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
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
  moveToFolder: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
      cta: () =>
        createModal((props) => (
          <MoveVMToFolderModal
            onSubmit={(folderName) => {
              const labels = vm?.metadata?.labels || {};
              labels[VM_FOLDER_LABEL] = folderName;
              return kubevirtK8sPatch({
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
  openConsole: (vm: V1VirtualMachine): ActionDropdownItemType => {
    const vmCluster = getCluster(vm);
    const vmNamespace = getNamespace(vm);
    const vmName = getName(vm);

    return {
      cta: () => window.open(getConsoleStandaloneURL(vmNamespace, vmName, vmCluster)),
      description: isRunning(vm)
        ? t('Open console in new tab')
        : t('The VirtualMachine is not running'),
      disabled: !isRunning(vm),
      id: 'vm-action-open-console',
      label: t('Open Console'),
    };
  },
  pause: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
    confirmVMActions: boolean,
  ): ActionDropdownItemType => {
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
      disabled: !isRunning(vm) || isSnapshotting(vm) || isRestoring(vm),
      id: 'vm-action-pause',
      label: t('Pause'),
    };
  },
  reset: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
    confirmVMActions: boolean,
  ): ActionDropdownItemType => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
      cta: () =>
        confirmVMActions
          ? createModal(({ isOpen, onClose }) => (
              <ConfirmVMActionModal
                checkToConfirmMessage={t(
                  'A VM reset is a hard power cycle and might cause data loss or corruption. Only reset if the VM is completely unresponsive.',
                )}
                action={resetVM}
                actionType="Reset"
                isOpen={isOpen}
                onClose={onClose}
                severityVariant="warning"
                vm={vm}
              />
            ))
          : resetVM(vm),
      description: t('Hard power cycle on the VM'),
      disabled: !isRunning(vm) || isSnapshotting(vm) || isRestoring(vm),
      id: 'vm-action-reset',
      label: t('Reset'),
    };
  },
  restart: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
    confirmVMActions: boolean,
  ): ActionDropdownItemType => {
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
      description: t('Shut down and reboot the VM'),
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
  snapshot: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => {
    return {
      accessReview: asAccessReview(VirtualMachineSnapshotModel, vm, 'create'),
      cta: () => createModal((props) => <SnapshotModal vm={vm} {...props} />),
      id: 'vm-action-snapshot',
      label: t('Take snapshot'),
    };
  },
  start: (vm: V1VirtualMachine): ActionDropdownItemType => {
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
  ): ActionDropdownItemType => {
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
  unpause: (vm: V1VirtualMachine): ActionDropdownItemType => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
      cta: () => unpauseVM(vm),
      disabled: vm?.status?.printableStatus !== Paused,
      id: 'vm-action-unpause',
      label: t('Unpause'),
    };
  },
};
