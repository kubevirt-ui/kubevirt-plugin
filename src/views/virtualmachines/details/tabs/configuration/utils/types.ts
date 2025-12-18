import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { InstanceTypeUnion } from '@kubevirt-utils/resources/instancetype/types';

export type ConfigurationInnerTabProps = {
  allInstanceTypes?: InstanceTypeUnion[];
  instanceTypeVM?: V1VirtualMachine;
  vm?: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};
