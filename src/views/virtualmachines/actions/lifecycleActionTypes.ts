// Extracted from VirtualMachineActionFactory.tsx
// Root: src/views/virtualmachines/actions/VirtualMachineActionFactory.tsx

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { type ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';

export type LifecycleActions = {
  forceStop: (vm: V1VirtualMachine) => ActionDropdownItemType;
  pause: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
    confirmVMActions: boolean,
  ) => ActionDropdownItemType;
  reset: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
    confirmVMActions: boolean,
  ) => ActionDropdownItemType;
  restart: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
    confirmVMActions: boolean,
  ) => ActionDropdownItemType;
  start: (vm: V1VirtualMachine) => ActionDropdownItemType;
  stop: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
    confirmVMActions: boolean,
  ) => ActionDropdownItemType;
  unpause: (vm: V1VirtualMachine) => ActionDropdownItemType;
};

export type ConfirmVMActionFn = (
  vm: V1VirtualMachine,
  createModal: (modal: ModalComponent) => void,
  confirmVMActions: boolean,
) => ActionDropdownItemType;
