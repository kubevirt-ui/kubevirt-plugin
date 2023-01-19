export type InstanceTypeSize = 'medium' | 'large' | 'xlarge' | '2xlarge' | '4xlarge' | '8xlarge';

export enum InstanceTypeCategory {
  GeneralPurpose = 'GeneralPurpose',
  ComputeIntensive = 'ComputeIntensive',
  MemoryIntensive = 'MemoryIntensive',
  GpuResourcesAttached = 'GpuResourcesAttached',
}

export type InstanceTypeSizeDetails = {
  name: InstanceTypeSize;
  label: string;
  cores: number;
  memory: string;
};

export type CategoryCustomData = {
  category: InstanceTypeCategory;
  selectedCategory: InstanceTypeCategory;
  selectedSize: InstanceTypeSize;
};

export type InstanceTypeDetails = {
  title: string;
  Icon: any;
  prefix: string;
  seriesLabel: string;
  instanceTypes: InstanceTypeSizeDetails[];
};

export type InstanceTypesDetails = { [key in InstanceTypeCategory]: InstanceTypeDetails };
