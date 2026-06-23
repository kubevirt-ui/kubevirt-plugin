import type { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import type { StorageMigrationAPI } from '../constants';
import { STORAGE_MIGRATION_API } from '../constants';

import { mtcBackend } from './mtcBackend';
import { multiNsBackend } from './multiNsBackend';
import { singleNsBackend } from './singleNsBackend';
import type { StorageMigrationBackendDescriptor } from './types';

const backendsByApi: Record<
  | typeof STORAGE_MIGRATION_API.MTC
  | typeof STORAGE_MIGRATION_API.MULTI_NS
  | typeof STORAGE_MIGRATION_API.SINGLE_NS,
  StorageMigrationBackendDescriptor
> = {
  [STORAGE_MIGRATION_API.MTC]: mtcBackend,
  [STORAGE_MIGRATION_API.MULTI_NS]: multiNsBackend,
  [STORAGE_MIGRATION_API.SINGLE_NS]: singleNsBackend,
};

export const STORAGE_MIGRATION_BACKENDS: StorageMigrationBackendDescriptor[] = [
  multiNsBackend,
  singleNsBackend,
  mtcBackend,
];

export const getStorageMigrationBackend = (
  api: StorageMigrationAPI,
): null | StorageMigrationBackendDescriptor => {
  if (api === STORAGE_MIGRATION_API.LOADING || api === STORAGE_MIGRATION_API.NONE) {
    return null;
  }
  return backendsByApi[api] ?? null;
};

export const getStorageMigrationPlanModelForAPI = (api: StorageMigrationAPI): K8sModel | null =>
  getStorageMigrationBackend(api)?.planModel ?? null;

export { getStorageMigrationPlanModelForKind } from './planModels';
export type {
  MigrateVMsFn,
  MigrateVMsParams,
  ProgressComponentProps,
  StorageMigrationBackendDescriptor,
  StorageMigrationPlanOverviewNormalizer,
} from './types';
