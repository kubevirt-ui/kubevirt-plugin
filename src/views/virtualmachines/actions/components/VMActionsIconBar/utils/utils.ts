import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { EjectIcon, PauseIcon, PlayIcon, RedoIcon, SquareIcon } from '@patternfly/react-icons';
import { VMActionIconDetails } from '@virtualmachines/actions/components/VMActionsIconBar/utils/types';
import { VirtualMachineActionFactory } from '@virtualmachines/actions/VirtualMachineActionFactory';
import { isPaused, isRestoring, isSnapshotting } from '@virtualmachines/utils';

export const getVMActionIconsDetails = (
  vm: V1VirtualMachine,
  confirmVMActions: boolean,
  createModal: (modal: ModalComponent) => void,
): VMActionIconDetails[] => {
  if (isSnapshotting(vm) || isRestoring(vm)) return [];

  const startAction = VirtualMachineActionFactory.start(vm);
  const stopAction = VirtualMachineActionFactory.stop(vm, createModal, confirmVMActions);
  const restartAction = VirtualMachineActionFactory.restart(vm, createModal, confirmVMActions);
  const pauseAction = VirtualMachineActionFactory.pause(vm, createModal, confirmVMActions);

  return [
    {
      action: stopAction,
      Icon: SquareIcon,
      isDisabled: stopAction?.disabled,
    },
    {
      action: restartAction,
      Icon: RedoIcon,
      isDisabled: restartAction?.disabled,
    },
    {
      action: pauseAction,
      Icon: PauseIcon,
      isDisabled: pauseAction?.disabled,
      isHidden: isPaused(vm),
    },
    {
      action: VirtualMachineActionFactory.unpause(vm),
      Icon: EjectIcon,
      iconClassname: 'vm-actions-icon-bar__icon--unpause',
      isHidden: !isPaused(vm),
    },
    {
      action: startAction,
      Icon: PlayIcon,
      isDisabled: startAction?.disabled,
    },
  ];
};
