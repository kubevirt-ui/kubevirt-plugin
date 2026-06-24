import type { FC } from 'react';

import type { ProgressComponentProps } from '@kubevirt-utils/resources/migrations/backends/types';
import {
  type StorageMigrationAPI,
  STORAGE_MIGRATION_API,
} from '@kubevirt-utils/resources/migrations/constants';

import MtcProgress from './mtc/MtcProgress';
import MultiNsProgress from './multiNs/MultiNsProgress';
import SingleNsProgress from './singleNs/SingleNsProgress';

const PROGRESS_COMPONENT_BY_API: Partial<Record<StorageMigrationAPI, FC<ProgressComponentProps>>> =
  {
    [STORAGE_MIGRATION_API.MTC]: MtcProgress,
    [STORAGE_MIGRATION_API.MULTI_NS]: MultiNsProgress,
    [STORAGE_MIGRATION_API.SINGLE_NS]: SingleNsProgress,
  };

export const getStorageMigrationProgressComponent = (
  api: StorageMigrationAPI,
): FC<ProgressComponentProps> | null => PROGRESS_COMPONENT_BY_API[api] ?? null;
