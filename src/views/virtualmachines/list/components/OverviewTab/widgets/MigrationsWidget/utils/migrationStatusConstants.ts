import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import { STATUS_LIST_FILTER_PARAM } from '@virtualmachines/utils/constants';

import { buildFilterPath } from '../../shared/urlUtils';

export type MigrationStatusCounts = {
  failed: number;
  other: number;
  running: number;
  scheduled: number;
};

export const FAILED_STATUSES = [vmimStatuses.Failed];
export const RUNNING_STATUSES = [vmimStatuses.Running];
export const SCHEDULED_STATUSES = [vmimStatuses.Scheduled, vmimStatuses.Scheduling];
export const OTHER_STATUSES = [
  'Unset',
  vmimStatuses.TargetReady,
  vmimStatuses.Succeeded,
  vmimStatuses.PreparingTarget,
  vmimStatuses.Pending,
  vmimStatuses.Paused,
];

export const buildStatusFilterPath = (basePath: string, statuses: string[]): string =>
  buildFilterPath(basePath, STATUS_LIST_FILTER_PARAM, statuses.join(','));
