import { FC, ReactNode } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import {
  OVERVIEW_LEVEL_CLUSTER,
  OVERVIEW_LEVEL_MULTICLUSTER,
  OVERVIEW_LEVEL_PROJECT,
} from './constants';

export {
  GRID_CLUSTER_MIGRATION_STATUS,
  GRID_FOUR_EQUAL,
  GRID_NARROW_WIDE,
  GRID_THREE_EQUAL,
  GRID_TWO_EQUAL,
  GRID_VM_HEALTH,
  OVERVIEW_LEVEL_CLUSTER,
  OVERVIEW_LEVEL_MULTICLUSTER,
  OVERVIEW_LEVEL_PROJECT,
  SECTION_ID_CLUSTER_STATUS,
  SECTION_ID_MIGRATION_STATUS,
  SECTION_ID_RESOURCE_ALLOCATION,
  SECTION_ID_VM_HEALTH,
} from './constants';

export type OverviewLevel =
  | typeof OVERVIEW_LEVEL_CLUSTER
  | typeof OVERVIEW_LEVEL_MULTICLUSTER
  | typeof OVERVIEW_LEVEL_PROJECT;

export type OverviewSectionData = {
  cluster?: string;
  metricsUnavailable?: boolean;
  namespace?: string;
  subHeader?: ReactNode;
  title: string;
  vmNames?: string[];
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
