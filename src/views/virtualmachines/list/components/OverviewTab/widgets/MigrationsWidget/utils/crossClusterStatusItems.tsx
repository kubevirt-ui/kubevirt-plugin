import { type ReactNode } from 'react';
import { type TFunction } from 'i18next';

import { vmStatusIcon } from '@overview/OverviewTab/vm-statuses-card/utils/utils';

import { type CrossClusterMigrationCounts } from './mtvPlanStatus';

export type CrossClusterStatusItem = {
  count: number;
  icon: ReactNode;
  key: 'failed' | 'other' | 'running';
  label: string;
};

export const getCrossClusterStatusItems = (
  statusCounts: CrossClusterMigrationCounts,
  t: TFunction,
): CrossClusterStatusItem[] => [
  {
    count: statusCounts.failed,
    icon: <vmStatusIcon.Error />,
    key: 'failed',
    label: t('Failed'),
  },
  {
    count: statusCounts.running,
    icon: <vmStatusIcon.Running />,
    key: 'running',
    label: t('Running'),
  },
  {
    count: statusCounts.other,
    icon: <vmStatusIcon.Other />,
    key: 'other',
    label: t('Other'),
  },
];
