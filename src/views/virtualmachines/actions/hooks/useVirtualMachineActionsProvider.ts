import { useMemo } from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { getConsoleVirtctlCommand } from '@kubevirt-utils/components/SSHAccess/utils';
import { CONFIRM_VM_ACTIONS, TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { getUpdateStrategy } from '@kubevirt-utils/resources/vm';
import { UPDATE_STRATEGIES } from '@kubevirt-utils/resources/vm/utils/constants';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { printableVMStatus } from '../../utils';
import { VirtualMachineActionFactory } from '../VirtualMachineActionFactory';

type UseVirtualMachineActionsProvider = (
  vm: V1VirtualMachine,
  vmim?: V1VirtualMachineInstanceMigration,
  isSingleNodeCluster?: boolean,
) => [ActionDropdownItemType[], boolean, any];

const useVirtualMachineActionsProvider: UseVirtualMachineActionsProvider = (
  vm,
  vmim,
  isSingleNodeCluster,
) => {
  const { createModal } = useModal();
  const { featureEnabled: confirmVMActionsEnabled } = useFeatures(CONFIRM_VM_ACTIONS);

  const virtctlCommand = getConsoleVirtctlCommand(vm);

  const [, inFlight] = useK8sModel(VirtualMachineModelRef);

  const { featureEnabled: treeViewFoldersEnabled } = useFeatures(TREE_VIEW_FOLDERS);

  const actions: ActionDropdownItemType[] = useMemo(() => {
    const printableStatus = vm?.status?.printableStatus;
    const { Migrating, Paused } = printableVMStatus;

    const currentMigrationExist =
      vmim && ![vmimStatuses.Failed, vmimStatuses.Succeeded].includes(vmim?.status?.phase);

    const isStorageMigration =
      currentMigrationExist && getUpdateStrategy(vm) === UPDATE_STRATEGIES.Migration;
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

    const migrateCompute = VirtualMachineActionFactory.migrateCompute(vm, isSingleNodeCluster);

    const migrateStorage = VirtualMachineActionFactory.migrateStorage(vm, createModal);

    const cancelMigration = isStorageMigration
      ? VirtualMachineActionFactory.cancelStorageMigration(vm, vmim, isSingleNodeCluster)
      : VirtualMachineActionFactory.cancelComputeMigration(vm, vmim, isSingleNodeCluster);

    const migrationActions =
      isComputeMigration || isStorageMigration
        ? [cancelMigration]
        : [migrateCompute, migrateStorage];

    const pauseOrUnpause =
      printableStatus === Paused
        ? VirtualMachineActionFactory.unpause(vm)
        : VirtualMachineActionFactory.pause(vm, createModal, confirmVMActionsEnabled);

    return [
      startOrStop,
      VirtualMachineActionFactory.restart(vm, createModal, confirmVMActionsEnabled),
      pauseOrUnpause,
      VirtualMachineActionFactory.clone(vm, createModal),
      VirtualMachineActionFactory.snapshot(vm, createModal),
      VirtualMachineActionFactory.migrationActions(migrationActions),
      VirtualMachineActionFactory.copySSHCommand(vm, virtctlCommand),
      treeViewFoldersEnabled && VirtualMachineActionFactory.moveToFolder(vm, createModal),
      VirtualMachineActionFactory.delete(vm, createModal),
    ].filter(Boolean);
  }, [vm, vmim, isSingleNodeCluster, createModal, virtctlCommand, treeViewFoldersEnabled]);

  return useMemo(() => [actions, !inFlight, undefined], [actions, inFlight]);
};

export default useVirtualMachineActionsProvider;
