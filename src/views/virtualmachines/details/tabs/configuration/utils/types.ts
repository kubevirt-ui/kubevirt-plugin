import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

export type ConfigurationInnerTabProps = {
  instanceTypeVM?: V1VirtualMachine;
  vm?: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};
