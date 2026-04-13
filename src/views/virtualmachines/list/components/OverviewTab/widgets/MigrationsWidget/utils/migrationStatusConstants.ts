import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import { STATUS_LIST_FILTER_PARAM } from '@virtualmachines/utils/constants';

import { buildFilterPath } from '../../shared/urlUtils';

export const FAILED_STATUSES = [vmimStatuses.Failed];
export const RUNNING_STATUSES = [vmimStatuses.Running];
export const SCHEDULED_STATUSES = [vmimStatuses.Scheduled, vmimStatuses.Scheduling];
export const SUCCEEDED_STATUSES = [vmimStatuses.Succeeded];
export const OTHER_STATUSES = [
  'Unset',
  vmimStatuses.TargetReady,
  vmimStatuses.PreparingTarget,
  vmimStatuses.Pending,
  vmimStatuses.Paused,
];

export const buildStatusFilterPath = (basePath: string, statuses: string[]): string =>
  buildFilterPath(basePath, STATUS_LIST_FILTER_PARAM, statuses.join(','));
