import * as React from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { getConsoleVirtctlCommand } from '@kubevirt-utils/components/SSHAccess/utils';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { getCloudInitCredentials } from '@kubevirt-utils/resources/vmi';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import { Action, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { printableVMStatus } from '../../utils';
import { VirtualMachineActionFactory } from '../VirtualMachineActionFactory';

type UseVirtualMachineActionsProvider = (
  vm: V1VirtualMachine,
  vmim?: V1VirtualMachineInstanceMigration,
  isSingleNodeCluster?: boolean,
) => [Action[], boolean, any];

const useVirtualMachineActionsProvider: UseVirtualMachineActionsProvider = (
  vm,
  vmim,
  isSingleNodeCluster,
) => {
  const { createModal } = useModal();
  const userName = getCloudInitCredentials(vm)?.users?.[0]?.name;
  const virtctlCommand = getConsoleVirtctlCommand(
    userName,
    vm?.metadata?.name,
    vm?.metadata?.namespace,
  );

  const [, inFlight] = useK8sModel(VirtualMachineModelRef);
  const actions: Action[] = React.useMemo(() => {
    const printableStatus = vm?.status?.printableStatus;
    const { Paused, Migrating } = printableVMStatus;

    const startOrStop = ((printableStatusMachine) => {
      const map = {
        Stopping: VirtualMachineActionFactory.forceStop(vm),
        Stopped: VirtualMachineActionFactory.start(vm),
        default: VirtualMachineActionFactory.stop(vm),
      };
      return map[printableStatusMachine] || map.default;
    })(printableStatus);

    const migrateOrCancelMigration =
      printableStatus === Migrating ||
      (vmim && ![vmimStatuses.Failed, vmimStatuses.Succeeded].includes(vmim?.status?.phase))
        ? VirtualMachineActionFactory.cancelMigration(vm, vmim, isSingleNodeCluster)
        : VirtualMachineActionFactory.migrate(vm, isSingleNodeCluster);

    const pauseOrUnpause =
      printableStatus === Paused
        ? VirtualMachineActionFactory.unpause(vm)
        : VirtualMachineActionFactory.pause(vm);

    return [
      startOrStop,
      VirtualMachineActionFactory.restart(vm),
      pauseOrUnpause,
      VirtualMachineActionFactory.clone(vm, createModal),
      migrateOrCancelMigration,
      // VirtualMachineActionFactory.openConsole(vm),
      VirtualMachineActionFactory.copySSHCommand(vm, virtctlCommand),
      VirtualMachineActionFactory.editLabels(vm, createModal),
      VirtualMachineActionFactory.editAnnotations(vm, createModal),
      VirtualMachineActionFactory.delete(vm, createModal),
    ];
  }, [vm, vmim, isSingleNodeCluster, createModal, virtctlCommand]);

  return React.useMemo(() => [actions, !inFlight, undefined], [actions, inFlight]);
};

export default useVirtualMachineActionsProvider;
