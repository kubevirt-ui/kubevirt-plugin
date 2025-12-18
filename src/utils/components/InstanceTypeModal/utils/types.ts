import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  InstanceTypeSeries,
  InstanceTypeSize,
  InstanceTypeUnion,
} from '@kubevirt-utils/resources/instancetype/types';

export type InstanceTypeRecord = {
  instanceType: InstanceTypeUnion;
  prettyDisplaySize: string;
  series: string;
  seriesDisplayName: string;
  size: string;
};

export type MappedInstanceTypes = Record<
  InstanceTypeSeries,
  {
    sizes: {
      [key in InstanceTypeSize]?: InstanceTypeRecord;
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
