import { type ComponentClass } from 'react';

import { type InstanceTypeSize } from '@kubevirt-utils/resources/instancetype/types';

export enum InstanceTypeCategory {
  ComputeIntensive = 'ComputeIntensive',
  GeneralPurpose = 'GeneralPurpose',
  GpuResourcesAttached = 'GpuResourcesAttached',
  MemoryIntensive = 'MemoryIntensive',
}

export type InstanceTypeSizeDetails = {
  cpus: number;
  label: string;
  memory: string;
  name: InstanceTypeSize;
};

export type CategoryDetails = {
  Icon: ComponentClass;
  instanceTypes: InstanceTypeSizeDetails[];
  prefix: string;
  prefixLabel: string;
  seriesLabel: string;
  title: string;
};

export type CategoryDetailsMap = { [key in InstanceTypeCategory]: CategoryDetails };
