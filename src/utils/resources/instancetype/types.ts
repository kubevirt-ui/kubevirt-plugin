import {
  V1beta1VirtualMachineClusterInstancetype,
  V1beta1VirtualMachineInstancetype,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

// InstanceType series and sizes follow common-instancetypes@1.5.1 (https://github.com/kubevirt/common-instancetypes?tab=readme-ov-file#schema)

export type InstanceTypeSize =
  | '2xlarge'
  | '2xlarge1gi'
  | '2xmedium'
  | '4xlarge'
  | '4xlarge1gi'
  | '8xlarge'
  | '8xlarge1gi'
  | 'large'
  | 'large1gi'
  | 'medium'
  | 'medium1gi'
  | 'micro'
  | 'nano'
  | 'small'
  | 'xlarge'
  | 'xlarge1gi';

export type InstanceTypeSeries = 'cx1' | 'd1' | 'm1' | 'n1' | 'o1' | 'rt1' | 'u1';

export type InstanceTypeUnion =
  | V1beta1VirtualMachineClusterInstancetype
  | V1beta1VirtualMachineInstancetype;
