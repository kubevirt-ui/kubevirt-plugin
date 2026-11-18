import { type TFunction } from 'i18next';

import { type BuildParentTreeNodeArgs } from '@virtualmachines/tree/types/types';

export type BuildClusterTreeNodeArgs = BuildParentTreeNodeArgs & {
  clusterName: string;
  t: TFunction;
};
