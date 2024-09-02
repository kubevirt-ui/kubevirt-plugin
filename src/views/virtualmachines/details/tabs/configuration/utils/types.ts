import {
  V1beta1VirtualMachineClusterInstancetype,
  V1beta1VirtualMachineInstancetype,
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui/kubevirt-api/kubevirt';

export type InstanceTypeUnion =
  | V1beta1VirtualMachineClusterInstancetype
  | V1beta1VirtualMachineInstancetype;

export type ConfigurationInnerTabProps = {
  allInstanceTypes?: InstanceTypeUnion[];
  instanceTypeVM?: V1VirtualMachine;
  vm?: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};
