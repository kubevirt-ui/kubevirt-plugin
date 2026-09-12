import { type PendingChange } from '../utils/types';
import { getDetailsPendingChanges } from './buildPendingChanges/detailsPendingChanges';
import { getHardwarePendingChanges } from './buildPendingChanges/hardwarePendingChanges';
import { getSchedulingPendingChanges } from './buildPendingChanges/schedulingPendingChanges';
import {
  type BuildPendingChangesParams,
  createPendingChangeContext,
} from './buildPendingChanges/types';

export const buildPendingChanges = (params: BuildPendingChangesParams): PendingChange[] => {
  const context = createPendingChangeContext(params);

  return [
    ...getDetailsPendingChanges(context),
    ...getHardwarePendingChanges(context),
    ...getSchedulingPendingChanges(context),
  ];
};
