import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

export type DedicatedResourcesModalProps = {
  headerText: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};
