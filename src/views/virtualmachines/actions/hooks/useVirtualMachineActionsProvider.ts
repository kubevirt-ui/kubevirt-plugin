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
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { printableVMStatus } from '../../utils';
import { VirtualMachineActionFactory } from '../VirtualMachineActionFactory';

import useIsMTCInstalled from './useIsMTCInstalled';
import useCurrentStorageMigration from './useStorageMigrations';

type UseVirtualMachineActionsProvider = (
  vm: V1VirtualMachine,
  vmim?: V1VirtualMachineInstanceMigration,
) => [ActionDropdownItemType[], boolean, any];

const useVirtualMachineActionsProvider: UseVirtualMachineActionsProvider = (vm, vmim) => {
  const { createModal } = useModal();
  const { featureEnabled: confirmVMActionsEnabled } = useFeatures(CONFIRM_VM_ACTIONS);

  const virtctlCommand = getConsoleVirtctlCommand(vm);

  const mtcInstalled = useIsMTCInstalled();
  const [currentStorageMigration, currentStorageMigrationLoaded] = useCurrentStorageMigration(vm);

  const [, inFlight] = useK8sModel(VirtualMachineModelRef);

  const { featureEnabled: treeViewFoldersEnabled } = useFeatures(TREE_VIEW_FOLDERS);

  const actions: ActionDropdownItemType[] = useMemo(() => {
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

    const migrateCompute = VirtualMachineActionFactory.migrateCompute(vm);

    const migrateStorage = VirtualMachineActionFactory.migrateStorage(vm, createModal);

    const startMigrationActions = mtcInstalled
      ? [migrateCompute, migrateStorage]
      : [migrateCompute];

    const cancelMigration = currentStorageMigration
      ? VirtualMachineActionFactory.cancelStorageMigration(currentStorageMigration)
      : VirtualMachineActionFactory.cancelComputeMigration(vm, vmim);

    const migrationActions =
      isComputeMigration || currentStorageMigration ? [cancelMigration] : startMigrationActions;

    const pauseOrUnpause =
      printableStatus === Paused
        ? VirtualMachineActionFactory.unpause(vm)
        : VirtualMachineActionFactory.pause(vm, createModal, confirmVMActionsEnabled);

    return [
      VirtualMachineActionFactory.editLabels(vm, createModal),
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
  }, [
    vm,
    vmim,
    createModal,
    currentStorageMigration,
    confirmVMActionsEnabled,
    virtctlCommand,
    treeViewFoldersEnabled,
    mtcInstalled,
  ]);

  return useMemo(
    () => [actions, !inFlight && currentStorageMigrationLoaded, undefined],
    [actions, inFlight, currentStorageMigrationLoaded],
  );
};

export default useVirtualMachineActionsProvider;
