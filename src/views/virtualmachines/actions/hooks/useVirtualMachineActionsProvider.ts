import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { Action, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { printableVMStatus } from '../../utils';
import { VirtualMachineActionFactory } from '../VirtualMachineActionFactory';

import useVirtualMachineInstanceMigration from './useVirtualMachineInstanceMigration';

type UseVirtualMachineActionsProvider = (vm: V1VirtualMachine) => [Action[], boolean, any];

const useVirtualMachineActionsProvider: UseVirtualMachineActionsProvider = (vm) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const vmim = useVirtualMachineInstanceMigration(vm);

  const [, inFlight] = useK8sModel(VirtualMachineModelRef);
  const actions: Action[] = React.useMemo(() => {
    const printableStatus = vm?.status?.printableStatus;
    const { Stopped, Paused, Migrating } = printableVMStatus;

    const startOrStop =
      printableStatus === Stopped
        ? VirtualMachineActionFactory.start(vm, t)
        : VirtualMachineActionFactory.stop(vm, t);

    const migrateOrCancelMigration =
      printableStatus === Migrating || vmim
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
      VirtualMachineActionFactory.editLabels(vm, createModal, t),
      VirtualMachineActionFactory.editAnnotations(vm, createModal, t),
      VirtualMachineActionFactory.delete(vm, createModal, t),
    ];
  }, [vm, vmim, createModal, t]);

  return React.useMemo(() => [actions, !inFlight, undefined], [actions, inFlight]);
};

export default useVirtualMachineActionsProvider;
