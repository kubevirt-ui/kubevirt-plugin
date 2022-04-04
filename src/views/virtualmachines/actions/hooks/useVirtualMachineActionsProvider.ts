import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { Action, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { printableVMStatus } from '../../utils';
import { VirtualMachineActionFactory } from '../VirtualMachineActionFactory';

import useVirtualMachineInstanceMigration from './useVirtualMachineInstanceMigration';

type UseVirtualMachineActionsProvider = (vm: V1VirtualMachine) => [Action[], boolean, any];

const useVirtualMachineActionsProvider: UseVirtualMachineActionsProvider = (vm) => {
  const { createModal } = useModal();
  const vmim = useVirtualMachineInstanceMigration(vm);

  const [, inFlight] = useK8sModel(VirtualMachineModelRef);
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
      VirtualMachineActionFactory.editAnnotations(vm, createModal),
      VirtualMachineActionFactory.editLabels(vm, createModal),
      VirtualMachineActionFactory.delete(vm),
    ];
  }, [vm, vmim, createModal]);

  return [actions, inFlight, undefined];
};

export default useVirtualMachineActionsProvider;
