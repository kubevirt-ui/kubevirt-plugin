import React from 'react';
import { TFunction } from 'react-i18next';

import {
  VirtualMachineCloneModel,
  VirtualMachineTemplateRequestModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineInstanceMigrationModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineSnapshotModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import CloneVMModal from '@kubevirt-utils/components/CloneVMModal/CloneVMModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import RunStrategyModal from '@kubevirt-utils/components/RunStrategyModal/RunStrategyModal';
import { updateRunStrategy } from '@kubevirt-utils/components/RunStrategyModal/utils';
import SaveAsTemplateModal from '@kubevirt-utils/components/SaveAsTemplateModal/SaveAsTemplateModal';
import SnapshotModal from '@kubevirt-utils/components/SnapshotModal/SnapshotModal';
import {
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
  VirtualMachineInstanceSubresourcesModel,
  VirtualMachineSubresourcesModel,
} from '@kubevirt-utils/models';
import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import { asAccessReview, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getVMSSHSecretName } from '@kubevirt-utils/resources/vm';
import {
  getEffectiveRunStrategy,
  isVMNotStopped,
} from '@kubevirt-utils/resources/vm/utils/selectors';
import { getMigratableVolumeSnapshotStatuses } from '@kubevirt-utils/resources/vm/utils/snapshotStatuses';
import { getNoPermissionTooltipContent } from '@kubevirt-utils/utils/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { getConsoleStandaloneURL } from '@multicluster/urls';
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
import { VM_ACTIONS } from './components/ConfirmVMActionModal/constants';
import DeleteVMModal from './components/DeleteVMModal/DeleteVMModal';
import { ACTIONS_ID } from './hooks/constants';
import {
  cancelMigration,
  cancelStorageMigrationPlan,
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

export const createVirtualMachineActionFactory = (t: TFunction) => ({
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
      id: ACTIONS_ID.CANCEL_COMPUTE_MIGRATION,
      label: t('Cancel compute migration'),
    };
  },
  cancelStorageMigration: (
    vm: V1VirtualMachine,
    storageMigrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan,
  ): ActionDropdownItemType => {
    return {
      accessReview: {
        cluster: getCluster(vm),
        group: MultiNamespaceVirtualMachineStorageMigrationPlanModel.apiGroup,
        namespace: getNamespace(vm),
        resource: MultiNamespaceVirtualMachineStorageMigrationPlanModel.plural,
        verb: 'delete',
      },
      cta: () => cancelStorageMigrationPlan(vm, storageMigrationPlan),
      description:
        !!storageMigrationPlan?.metadata?.deletionTimestamp && t('Canceling ongoing migration'),
      disabled: !storageMigrationPlan || !!storageMigrationPlan?.metadata?.deletionTimestamp,
      id: 'vm-action-cancel-storage-migrate',
      label: t('Cancel storage migration'),
    };
  },
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
  controlActions: (controlActions: ActionDropdownItemType[]): ActionDropdownItemType => ({
    cta: () => null, // follow migrationActions
    id: ACTIONS_ID.CONTROL_MENU,
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
      id: ACTIONS_ID.COPY_SSH_COMMAND,
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
      id: ACTIONS_ID.DELETE,
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
    id: ACTIONS_ID.EDIT_LABELS,
    label: t('Edit labels'),
  }),
  editRunStrategy: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => ({
    accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
    cta: () =>
      createModal(({ isOpen, onClose }) => (
        <RunStrategyModal
          initialRunStrategy={getEffectiveRunStrategy(vm)}
          isOpen={isOpen}
          isVMRunning={isVMNotStopped(vm)}
          onClose={onClose}
          onSubmit={(runStrategy) => updateRunStrategy(vm, runStrategy)}
        />
      )),
    id: ACTIONS_ID.EDIT_RUN_STRATEGY,
    label: t('Edit run strategy'),
  }),
  forceStop: (vm: V1VirtualMachine): ActionDropdownItemType => {
    return {
      accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
      cta: () =>
        stopVM(vm, {
          gracePeriod: 0,
        }),
      disabled: [Migrating, Provisioning, Stopped, Unknown].includes(vm?.status?.printableStatus),
      id: ACTIONS_ID.FORCE_STOP,
      label: t('Force stop'),
    };
  },
  migrateCompute: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => {
    const liveMigratable = isLiveMigratable(vm);

    const getDisabledTooltip = () => {
      if (liveMigratable) {
        return getNoPermissionTooltipContent(t);
      }
      if (!isRunning(vm)) {
        return t('The VirtualMachine is not running');
      }
      return t('The VirtualMachine is not live migratable');
    };

    return {
      accessReview: {
        cluster: getCluster(vm),
        group: VirtualMachineInstanceMigrationModel.apiGroup,
        namespace: getNamespace(vm),
        resource: VirtualMachineInstanceMigrationModel.plural,
        verb: 'create',
      },
      cta: () => createModal((props) => <ComputeMigrationModal {...props} vm={vm} />),
      description: t('Migrate VirtualMachine to a different Node'),
      disabled: !liveMigratable,
      disabledTooltip: getDisabledTooltip(),
      id: ACTIONS_ID.MIGRATE_COMPUTE,
      label: t('Compute'),
    };
  },
  migrateStorage: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => {
    return {
      accessReview: {
        cluster: getCluster(vm),
        group: MultiNamespaceVirtualMachineStorageMigrationPlanModel.apiGroup,
        namespace: getNamespace(vm),
        resource: MultiNamespaceVirtualMachineStorageMigrationPlanModel.plural,
        verb: 'create',
      },
      cta: () => createModal((props) => <VirtualMachineMigrateModal vms={[vm]} {...props} />),
      description: t('Migrate VirtualMachine storage to a different StorageClass'),
      disabledTooltip: getNoPermissionTooltipContent(t),
      id: ACTIONS_ID.MIGRATE_STORAGE,
      label: t('Storage'),
    };
  },
  migrationActions: (migrationActions): ActionDropdownItemType => ({
    cta: () => null, // Required to avoid breaking actions in the topology view
    id: ACTIONS_ID.MIGRATION_MENU,
    label: t('Migration'),
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
      id: ACTIONS_ID.MOVE_TO_FOLDER,
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
      id: ACTIONS_ID.OPEN_CONSOLE,
      label: t('Open Console'),
    };
  },
  pause: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
    confirmVMActions: boolean,
  ): ActionDropdownItemType => {
    return {
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
                actionType={VM_ACTIONS.reset}
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
    };
  },
  restart: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
    confirmVMActions: boolean,
  ): ActionDropdownItemType => {
    return {
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
    };
  },
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
  ): ActionDropdownItemType => {
    return {
      accessReview: asAccessReview(VirtualMachineSnapshotModel, vm, 'create'),
      cta: () => createModal((props) => <SnapshotModal vm={vm} {...props} />),
      id: ACTIONS_ID.SNAPSHOT,
      label: t('Take snapshot'),
    };
  },
  start: (vm: V1VirtualMachine): ActionDropdownItemType => {
    return {
      accessReview: asAccessReview(VirtualMachineSubresourcesModel, vm, 'update', 'start'),
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
      id: ACTIONS_ID.START,
      label: t('Start'),
    };
  },
  stop: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
    confirmVMActions: boolean,
  ): ActionDropdownItemType => {
    return {
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
    };
  },
  unpause: (vm: V1VirtualMachine): ActionDropdownItemType => {
    return {
      accessReview: asAccessReview(
        VirtualMachineInstanceSubresourcesModel,
        vm,
        'update',
        'unpause',
      ),
      cta: () => unpauseVM(vm),
      disabled: vm?.status?.printableStatus !== Paused,
      id: ACTIONS_ID.UNPAUSE,
      label: t('Unpause'),
    };
  },
});
