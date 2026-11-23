import type {
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

export type PanicDeviceDescriptionItemProps = {
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};
