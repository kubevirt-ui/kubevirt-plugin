import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isPaused, isRunning, isStopped } from '@virtualmachines/utils';

import { pauseVM, restartVM, startVM, stopVM, unpauseVM } from '../actions';

import { ACTIONS_ID } from './constants';

type UseMultipleVirtualMachineActions = (vms: V1VirtualMachine[]) => ActionDropdownItemType[];

const useMultipleVirtualMachineActions: UseMultipleVirtualMachineActions = (vms) => {
  const { t } = useKubevirtTranslation();

  return useMemo(() => {
    const actions: ActionDropdownItemType[] = [
      {
        cta: () => vms.forEach(startVM),
        id: ACTIONS_ID.START,
        label: t('Start'),
      },
      {
        cta: () => vms.forEach(restartVM),
        id: ACTIONS_ID.RESTART,
        label: t('Restart'),
      },
      {
        cta: () => vms.forEach((vm) => stopVM(vm)),
        id: ACTIONS_ID.STOP,
        label: t('Stop'),
      },
      {
        cta: () => vms.forEach(pauseVM),
        id: ACTIONS_ID.PAUSE,
        label: t('Pause'),
      },
      {
        cta: () => vms.forEach(unpauseVM),
        id: ACTIONS_ID.UNPAUSE,
        label: t('Unpause'),
      },
    ];

    if (vms.every(isStopped)) {
      return actions.filter((action) => action.id !== ACTIONS_ID.STOP);
    }

    if (vms.every(isRunning)) {
      return actions.filter((action) => action.id !== ACTIONS_ID.START);
    }

    if (vms.every(isPaused)) {
      return actions.filter((action) => action.id !== ACTIONS_ID.PAUSE);
    }

    return actions;
  }, [t, vms]);
};

export default useMultipleVirtualMachineActions;
