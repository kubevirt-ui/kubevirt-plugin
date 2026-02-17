import { useMemo } from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { getConsoleVirtctlCommand } from '@kubevirt-utils/components/SSHAccess/utils';
import { CONFIRM_VM_ACTIONS, TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import { CROSS_CLUSTER_MIGRATION_ACTION_ID } from '@multicluster/constants';
import useACMExtensionActions from '@multicluster/hooks/useACMExtensionActions/useACMExtensionActions';
import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { printableVMStatus } from '../../utils';
import { createVirtualMachineActionFactory } from '../VirtualMachineActionFactory';

import useIsMTVInstalled from './useIsMTVInstalled';

type UseVirtualMachineActionsProvider = (
  vm: V1VirtualMachine,
  vmim?: V1VirtualMachineInstanceMigration,
) => [ActionDropdownItemType[], boolean, any];

const useVirtualMachineActionsProvider: UseVirtualMachineActionsProvider = (vm, vmim) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { featureEnabled: confirmVMActionsEnabled } = useFeatures(CONFIRM_VM_ACTIONS);

  const virtctlCommand = getConsoleVirtctlCommand(vm);

  const mtvInstalled = useIsMTVInstalled();

  const acmActions = useACMExtensionActions(vm);

  const [, inFlight] = useK8sModel(VirtualMachineModelRef);

  const { featureEnabled: treeViewFoldersEnabled } = useFeatures(TREE_VIEW_FOLDERS);

  const VirtualMachineActionFactory = useMemo(() => createVirtualMachineActionFactory(t), [t]);

  const actions: ActionDropdownItemType[] = useMemo(() => {
    const crossClusterMigration = acmActions.find(
      (action) => action.id === CROSS_CLUSTER_MIGRATION_ACTION_ID,
    );

    const otherACMActions = acmActions.filter(
      (action) => action.id !== CROSS_CLUSTER_MIGRATION_ACTION_ID,
    );

    const printableStatus = vm?.status?.printableStatus;

    const { Migrating, Paused } = printableVMStatus;

    const currentMigrationExist =
      vmim && ![vmimStatuses.Failed, vmimStatuses.Succeeded].includes(vmim?.status?.phase);

    const isComputeMigration = printableStatus === Migrating || currentMigrationExist;

    const startOrStop = ((printableStatusMachine) => {
      const map = {
        default: VirtualMachineActionFactory.stop(vm, createModal, confirmVMActionsEnabled),
        Stopped: VirtualMachineActionFactory.start(vm),
        Stopping: VirtualMachineActionFactory.forceStop(vm),
        Terminating: VirtualMachineActionFactory.forceStop(vm),
      };
      return map[printableStatusMachine] || map.default;
    })(printableStatus);

    const migrateCompute = VirtualMachineActionFactory.migrateCompute(vm, createModal);

    const migrateStorage = VirtualMachineActionFactory.migrateStorage(vm, createModal);

    const startMigrationActions = [migrateCompute, migrateStorage];

    if (crossClusterMigration && mtvInstalled) {
      startMigrationActions.unshift(crossClusterMigration);
    }

    const migrationActions = isComputeMigration
      ? [VirtualMachineActionFactory.cancelComputeMigration(vm, vmim)]
      : startMigrationActions;

    const pauseOrUnpause =
      printableStatus === Paused
        ? VirtualMachineActionFactory.unpause(vm)
        : VirtualMachineActionFactory.pause(vm, createModal, confirmVMActionsEnabled);

    return [
      VirtualMachineActionFactory.controlActions([
        startOrStop,
        pauseOrUnpause,
        VirtualMachineActionFactory.restart(vm, createModal, confirmVMActionsEnabled),
        VirtualMachineActionFactory.reset(vm, createModal, confirmVMActionsEnabled),
      ]),

      VirtualMachineActionFactory.openConsole(vm),
      VirtualMachineActionFactory.clone(vm, createModal),
      VirtualMachineActionFactory.snapshot(vm, createModal),
      VirtualMachineActionFactory.migrationActions(migrationActions),
      VirtualMachineActionFactory.copySSHCommand(vm, virtctlCommand),
      treeViewFoldersEnabled && VirtualMachineActionFactory.moveToFolder(vm, createModal),
      VirtualMachineActionFactory.editLabels(vm, createModal),
      VirtualMachineActionFactory.delete(vm, createModal),
      ...otherACMActions,
    ].filter(Boolean);
  }, [
    vm,
    vmim,
    createModal,
    confirmVMActionsEnabled,
    virtctlCommand,
    treeViewFoldersEnabled,
    acmActions,
    mtvInstalled,
    VirtualMachineActionFactory,
  ]);

  return useMemo(() => [actions, !inFlight, undefined], [actions, inFlight]);
};

export default useVirtualMachineActionsProvider;
