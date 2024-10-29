import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { restartVM, startVM, stopVM, unpauseVM } from '../actions';

type UseMultipleVirtualMachineActions = (vms: V1VirtualMachine[]) => ActionDropdownItemType[];

const useMultipleVirtualMachineActions: UseMultipleVirtualMachineActions = (vms) => {
  const { t } = useKubevirtTranslation();

  const actions: ActionDropdownItemType[] = useMemo(() => {
    return [
      {
        cta: () => vms.forEach((vm) => startVM(vm)),
        id: 'vm-action-start',
        label: t('Start'),
      },
      {
        cta: () => vms.forEach((vm) => restartVM(vm)),
        id: 'vm-action-restart',
        label: t('Restart'),
      },
      {
        cta: () => vms.forEach((vm) => stopVM(vm)),
        id: 'vm-action-stop',
        label: t('Stop'),
      },
      {
        cta: () => vms.forEach((vm) => unpauseVM(vm)),
        id: 'vm-action-unpause',
        label: t('Unpause'),
      },
    ];
  }, [t, vms]);

  return actions;
};

export default useMultipleVirtualMachineActions;
