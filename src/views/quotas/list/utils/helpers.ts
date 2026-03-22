import {
  ApplicationAwareQuota,
  CalculationMethod,
  QuotaStatus,
} from '@kubevirt-utils/resources/quotas/types';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { SortByDirection } from '@patternfly/react-table';

import {
  getMainResourceKeys,
  getQuotaNumbers,
  getStatus,
  isNamespacedQuota,
} from '../../utils/utils';

export type QuotaCallbacks = {
  calculationMethod: CalculationMethod;
};

export const getQuotaStatusData = (row: ApplicationAwareQuota): QuotaStatus => {
  const quotaStatus = getStatus(row);
  return {
    hard: quotaStatus?.hard ?? {},
    used: quotaStatus?.used ?? {},
  };
};

export const getResourceKeysFromCallbacks = (
  callbacks: QuotaCallbacks,
): { cpu: string; memory: string; vmiCount: string } =>
  getMainResourceKeys(callbacks.calculationMethod === CalculationMethod.DedicatedVirtualResources);

const getPercentageForSort = (
  status: ReturnType<typeof getStatus>,
  resourceKey: string,
): null | number => {
  const hardValue = status?.hard?.[resourceKey];
  if (!hardValue) return null;
  return getQuotaNumbers(status?.used?.[resourceKey], hardValue)?.percentage ?? 0;
};

export const createSortByPercentage =
  (resourceKey: string) =>
  (data: ApplicationAwareQuota[], direction: SortByDirection): ApplicationAwareQuota[] =>
    [...data].sort((a, b) => {
      const statusA = getStatus(a);
      const statusB = getStatus(b);
      const percentageA = getPercentageForSort(statusA, resourceKey);
      const percentageB = getPercentageForSort(statusB, resourceKey);

      if (percentageA === null && percentageB === null) return 0;
      if (percentageA === null) return direction === SortByDirection.asc ? 1 : -1;
      if (percentageB === null) return direction === SortByDirection.asc ? -1 : 1;

      return direction === SortByDirection.asc
        ? percentageA - percentageB
        : percentageB - percentageA;
    });

export const getNamespaceColumnValue = (row: ApplicationAwareQuota): string => {
  if (isNamespacedQuota(row)) {
    return getNamespace(row) ?? '';
  }
  return row?.status?.namespaces?.map((ns) => ns.namespace).join(', ') ?? '';
};
