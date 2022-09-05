import * as React from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { getConsoleVirtctlCommand } from '@kubevirt-utils/components/SSHAccess/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import { Action, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { printableVMStatus } from '../../utils';
import { VirtualMachineActionFactory } from '../VirtualMachineActionFactory';

type UseVirtualMachineActionsProvider = (
  vm: V1VirtualMachine,
  vmim?: V1VirtualMachineInstanceMigration,
) => [Action[], boolean, any];

const useVirtualMachineActionsProvider: UseVirtualMachineActionsProvider = (vm, vmim) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const virtctlCommand = getConsoleVirtctlCommand(vm?.metadata?.name, vm?.metadata?.namespace);

  const [, inFlight] = useK8sModel(VirtualMachineModelRef);
  const actions: Action[] = React.useMemo(() => {
    const printableStatus = vm?.status?.printableStatus;
    const { Stopped, Paused, Migrating } = printableVMStatus;

    const startOrStop =
      printableStatus === Stopped
        ? VirtualMachineActionFactory.start(vm, t)
        : VirtualMachineActionFactory.stop(vm, t);

    const migrateOrCancelMigration =
      printableStatus === Migrating ||
      (vmim && ![vmimStatuses.Failed, vmimStatuses.Succeeded].includes(vmim?.status?.phase))
        ? VirtualMachineActionFactory.cancelMigration(vm, vmim, t)
        : VirtualMachineActionFactory.migrate(vm, t);

    const pauseOrUnpause =
      printableStatus === Paused
        ? VirtualMachineActionFactory.unpause(vm, t)
        : VirtualMachineActionFactory.pause(vm, t);

    return [
      startOrStop,
      VirtualMachineActionFactory.restart(vm, t),
      pauseOrUnpause,
      VirtualMachineActionFactory.clone(vm, createModal, t),
      migrateOrCancelMigration,
      // VirtualMachineActionFactory.openConsole(vm),
      VirtualMachineActionFactory.copySSHCommand(virtctlCommand, t),
      VirtualMachineActionFactory.editLabels(vm, createModal, t),
      VirtualMachineActionFactory.editAnnotations(vm, createModal, t),
      VirtualMachineActionFactory.delete(vm, createModal, t),
    ];
  }, [vm, vmim, virtctlCommand, createModal, t]);

  return React.useMemo(() => [actions, !inFlight, undefined], [actions, inFlight]);
};

export default useVirtualMachineActionsProvider;
