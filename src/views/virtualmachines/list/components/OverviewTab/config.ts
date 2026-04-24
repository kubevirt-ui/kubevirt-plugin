import { TFunction } from 'i18next';

import {
  OVERVIEW_LEVEL_CLUSTER,
  OVERVIEW_LEVEL_MULTICLUSTER,
  OVERVIEW_LEVEL_PROJECT,
  OverviewConfig,
  OverviewLevel,
  OverviewSectionConfig,
  SECTION_ID_CLUSTER_STATUS,
  SECTION_ID_MIGRATION_STATUS,
  SECTION_ID_RESOURCE_ALLOCATION,
  SECTION_ID_VM_HEALTH,
} from './types';
import {
  ClusterStatusWidget,
  MigrationStatusSection,
  ResourceAllocationSection,
  VirtualMachinesHealthWidget,
} from './widgets';

const getSharedSections = (t: TFunction): OverviewSectionConfig[] => [
  {
    Component: VirtualMachinesHealthWidget,
    id: SECTION_ID_VM_HEALTH,
    title: t('Virtual machine health'),
  },
  {
    Component: MigrationStatusSection,
    id: SECTION_ID_MIGRATION_STATUS,
    title: t('Migration statuses'),
  },
  {
    Component: ResourceAllocationSection,
    id: SECTION_ID_RESOURCE_ALLOCATION,
    title: t('Virtualization resource allocation and consumption'),
  },
];

/**
 * Returns the appropriate overview configuration based on the current level.
 * Cluster and multi-cluster levels prepend the Cluster status section;
 * project level shows only the shared sections.
 */
export const getOverviewConfig = (level: OverviewLevel, t: TFunction): OverviewConfig => {
  const shared = getSharedSections(t);

  if (level === OVERVIEW_LEVEL_PROJECT) {
    return { sections: shared };
  }

  return {
    sections: [
      {
        Component: ClusterStatusWidget,
        id: SECTION_ID_CLUSTER_STATUS,
        title: t('Cluster status'),
      },
      ...shared,
    ],
  };
};

/**
 * Determines the overview level based on namespace and cluster parameters.
 */
export const determineOverviewLevel = (
  namespace?: string,
  isMultiCluster?: boolean,
): OverviewLevel => {
  if (namespace) {
    return OVERVIEW_LEVEL_PROJECT;
  }
  if (isMultiCluster) {
    return OVERVIEW_LEVEL_MULTICLUSTER;
  }
  return OVERVIEW_LEVEL_CLUSTER;
};
