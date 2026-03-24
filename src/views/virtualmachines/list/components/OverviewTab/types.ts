import { FC, ReactNode } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

export const OVERVIEW_LEVEL_PROJECT = 'project' as const;
export const OVERVIEW_LEVEL_CLUSTER = 'cluster' as const;
export const OVERVIEW_LEVEL_MULTICLUSTER = 'multicluster' as const;

export type OverviewLevel =
  | typeof OVERVIEW_LEVEL_CLUSTER
  | typeof OVERVIEW_LEVEL_MULTICLUSTER
  | typeof OVERVIEW_LEVEL_PROJECT;

export const SECTION_ID_VM_HEALTH = 'vm-health';
export const SECTION_ID_CLUSTER_STATUS = 'cluster-status';
export const SECTION_ID_MIGRATION_STATUS = 'migration-status';
export const SECTION_ID_RESOURCE_ALLOCATION = 'resource-allocation';

export const GRID_THREE_EQUAL = '1fr 1fr 1fr';
export const GRID_TWO_EQUAL = '1fr 1fr';
export const GRID_NARROW_WIDE = '1fr 3fr';
export const GRID_FOUR_EQUAL = '1fr 1fr 1fr 1fr';
export const GRID_VM_HEALTH = '2fr 3fr 1fr';

export type OverviewSectionData = {
  cluster?: string;
  namespace?: string;
  subHeader?: ReactNode;
  title: string;
  vms: V1VirtualMachine[];
};

export type OverviewSectionConfig = {
  Component: FC<OverviewSectionData>;
  id: string;
  subHeader?: ReactNode;
  title: string;
};

export type OverviewConfig = {
  sections: OverviewSectionConfig[];
};

export type OverviewTabProps = {
  cluster?: string;
  namespace?: string;
};
