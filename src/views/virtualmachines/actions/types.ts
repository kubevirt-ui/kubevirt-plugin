import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';

export type BulkVirtualMachineActionFactory = {
  controlActions: (controlActions: ActionDropdownItemType[]) => ActionDropdownItemType;
  crossClusterMigration: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
    isDisabled: boolean,
  ) => ActionDropdownItemType;
  delete: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
    isDisabled: boolean,
  ) => ActionDropdownItemType;
  editLabels: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
  ) => ActionDropdownItemType;
  migrateCompute: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
  ) => ActionDropdownItemType;
  migrateStorage: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
  ) => ActionDropdownItemType;
  moveToFolder: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
  ) => ActionDropdownItemType;
  pause: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
    confirmVMActionsEnabled: boolean,
  ) => ActionDropdownItemType;
  reset: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
    confirmVMActionsEnabled: boolean,
  ) => ActionDropdownItemType;
  restart: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
    confirmVMActionsEnabled: boolean,
  ) => ActionDropdownItemType;
  snapshot: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
  ) => ActionDropdownItemType;
  start: (vms: V1VirtualMachine[]) => ActionDropdownItemType;
  stop: (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
    confirmVMActionsEnabled: boolean,
  ) => ActionDropdownItemType;
  unpause: (vms: V1VirtualMachine[]) => ActionDropdownItemType;
};
