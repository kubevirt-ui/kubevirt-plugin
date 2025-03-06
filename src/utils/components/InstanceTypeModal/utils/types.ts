import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { InstanceTypeUnion } from '@virtualmachines/details/tabs/configuration/utils/types';

export type InstanceTypesSeries =
  | 'cx1'
  | 'gn1'
  | 'highperformance'
  | 'm1'
  | 'n1'
  | 'o1'
  | 'rt1'
  | 'u1';

export type InstanceTypesSizes =
  | '2xlarge'
  | '4xlarge'
  | '8xlarge'
  | 'large'
  | 'medium'
  | 'micro'
  | 'nano'
  | 'small'
  | 'xlarge';

export type InstanceTypeRecord = {
  instanceType: InstanceTypeUnion;
  prettyDisplaySize: string;
  series: string;
  seriesDisplayName: string;
  size: string;
};

export type MappedInstanceTypes = Record<
  InstanceTypesSeries,
  {
    sizes: {
      [key in InstanceTypesSizes]?: InstanceTypeRecord;
    };
  } & { descriptionSeries?: string; displayNameSeries?: string }
>;

export type InstanceTypeModalProps = {
  allInstanceTypes: InstanceTypeUnion[];
  instanceType: InstanceTypeUnion;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    vmToBeUpdated: V1VirtualMachine,
    instanceType: InstanceTypeUnion,
  ) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
};
