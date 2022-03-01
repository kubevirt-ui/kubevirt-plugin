import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { Action } from '@openshift-console/dynamic-plugin-sdk';

import { printableVMStatus } from '../../utils';
import { VirtualMachineActionFactory } from '../VirtualMachineActionFactory';

import useVirtualMachineInstanceMigration from './useVirtualMachineInstanceMigration';

const useVirtualMachineActionsProvider = (vm: V1VirtualMachine) => {
  const vmim = useVirtualMachineInstanceMigration(vm);

  const actions: Action[] = React.useMemo(() => {
    const printableStatus = vm?.status?.printableStatus;
    const { Stopped, Paused, Migrating } = printableVMStatus;

    const startOrStop = [Stopped, Paused].includes(printableStatus)
      ? VirtualMachineActionFactory.start(vm)
      : VirtualMachineActionFactory.stop(vm);

    const migrateOrCancelMigration =
      printableStatus === Migrating || vmim
        ? VirtualMachineActionFactory.cancelMigration(vm, vmim)
        : VirtualMachineActionFactory.migrate(vm);

    const pauseOrUnpause =
      printableStatus === Paused
        ? VirtualMachineActionFactory.unpause(vm)
        : VirtualMachineActionFactory.pause(vm);
    return [
      startOrStop,
      VirtualMachineActionFactory.restart(vm),
      pauseOrUnpause,
      // VirtualMachineActionFactory.clone(vm),
      migrateOrCancelMigration,
      // VirtualMachineActionFactory.openConsole(vm),
      VirtualMachineActionFactory.delete(vm),
    ];
  }, [vm, vmim]);

  return { actions, loaded: true, loadError: undefined };
};

export default useVirtualMachineActionsProvider;
