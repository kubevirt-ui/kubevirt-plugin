import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { EjectIcon, PauseIcon, PlayIcon, RedoIcon, SquareIcon } from '@patternfly/react-icons';
import { VMActionIconDetails } from '@virtualmachines/actions/components/VMActionsIconBar/utils/types';
import { VirtualMachineActionFactory } from '@virtualmachines/actions/VirtualMachineActionFactory';
import {
  isPaused,
  isRestoring,
  isRunning,
  isSnapshotting,
  isStopped,
} from '@virtualmachines/utils';

export const getVMActionIconsDetails = (vm: V1VirtualMachine): VMActionIconDetails[] => {
  if (isSnapshotting(vm) || isRestoring(vm)) return [];

  return [
    {
      action: VirtualMachineActionFactory.stop(vm),
      Icon: SquareIcon,
      isDisabled: !isRunning(vm) && !isPaused(vm),
    },
    {
      action: VirtualMachineActionFactory.restart(vm),
      Icon: RedoIcon,
      isDisabled: !isRunning(vm) && !isPaused(vm),
    },
    {
      action: VirtualMachineActionFactory.pause(vm),
      Icon: PauseIcon,
      isDisabled: !isRunning(vm),
      isHidden: isPaused(vm),
    },
    {
      action: VirtualMachineActionFactory.unpause(vm),
      Icon: EjectIcon,
      iconClassname: 'vm-actions-icon-bar__icon--unpause',
      isHidden: !isPaused(vm),
    },
    {
      action: VirtualMachineActionFactory.start(vm),
      Icon: PlayIcon,
      isDisabled: !isStopped(vm),
    },
  ];
};
