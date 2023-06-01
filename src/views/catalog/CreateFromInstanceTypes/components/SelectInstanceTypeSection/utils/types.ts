import { MutableRefObject } from 'react';

type InstanceTypeSize = 'medium' | 'large' | 'xlarge' | '2xlarge' | '4xlarge' | '8xlarge';

export enum InstanceTypeCategory {
  GeneralPurpose = 'GeneralPurpose',
  ComputeIntensive = 'ComputeIntensive',
  MemoryIntensive = 'MemoryIntensive',
  GpuResourcesAttached = 'GpuResourcesAttached',
}

export type InstanceTypeSizeDetails = {
  name: InstanceTypeSize;
  label: string;
  cpus: number;
  memory: string;
};

export type CategoryDetails = {
  title: string;
  Icon: any;
  prefix: string;
  prefixLabel: string;
  seriesLabel: string;
  instanceTypes: InstanceTypeSizeDetails[];
};

export type CategoryDetailsMap = { [key in InstanceTypeCategory]: CategoryDetails };

export type UseInstanceTypeCardMenuSectionValues = {
  activeMenu: string;
  menuRef: MutableRefObject<HTMLDivElement>;
  onMenuToggle: (event?: React.MouseEvent, menuID?: string) => void;
  onMenuSelect: (itName: string) => void;
};
