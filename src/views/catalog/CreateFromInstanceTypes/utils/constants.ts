import {
  InstanceTypeCategory,
  InstanceTypeSize,
} from '../components/SelectInstanceTypeSection/utils/types';

export enum INSTANCE_TYPES_SECTIONS {
  SELECT_VOLUME = 1,
  SELECT_INSTANCE_TYPE = 2,
  VM_DETAILS = 3,
}

export const DEFAULT_PREFERENCE_LABEL = 'instancetype.kubevirt.io/default-preference';
export const DEFAULT_INSTANCETYPE_LABEL = 'instancetype.kubevirt.io/default-instancetype';

export type InstanceTypeState = {
  category: InstanceTypeCategory;
  size: InstanceTypeSize;
  name: string;
};

export const initialInstanceTypeState: InstanceTypeState = {
  category: null,
  size: null,
  name: null,
};
