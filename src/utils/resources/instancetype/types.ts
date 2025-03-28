import {
  V1beta1VirtualMachineClusterInstancetype,
  V1beta1VirtualMachineInstancetype,
} from '@kubevirt-ui/kubevirt-api/kubevirt';

export type InstanceTypeSize =
  | '2xlarge'
  | '2xmedium'
  | '4xlarge'
  | '8xlarge'
  | 'large'
  | 'medium'
  | 'micro'
  | 'nano'
  | 'small'
  | 'xlarge';

export type InstanceTypeSeries =
  | 'cx1'
  | 'gn1'
  | 'highperformance'
  | 'm1'
  | 'n1'
  | 'o1'
  | 'rt1'
  | 'u1';

export type InstanceTypeUnion =
  | V1beta1VirtualMachineClusterInstancetype
  | V1beta1VirtualMachineInstancetype;
