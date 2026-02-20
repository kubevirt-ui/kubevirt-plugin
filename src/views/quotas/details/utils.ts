import { TFunction } from 'react-i18next';
import {
  getQuotaNumbers,
  getResourceKeyKind,
  getResourceLabel,
} from 'src/views/quotas/utils/utils';

import { humanizeCpuCores } from '@kubevirt-utils/utils/humanize.js';
import { getHumanizedSize } from '@kubevirt-utils/utils/units';

import { ResourceKeyKind } from './types';

export const getCountText = (
  count: number,
  resourceKeyKind: ResourceKeyKind,
  resourceLabel: string,
): string => {
  if (resourceKeyKind === ResourceKeyKind.CPU) {
    return `${humanizeCpuCores(count).string} vCPU`;
  }
  if (resourceKeyKind === ResourceKeyKind.MEMORY) {
    return getHumanizedSize(`${count}`, 'withB', 'GiB').string;
  }
  return `${count.toString()} ${resourceLabel}`;
};

export const getStatusChartInfo = (
  resourceKey: string,
  usedValue: string,
  maxValue: string,
  t: TFunction,
) => {
  const resourceLabel = getResourceLabel(resourceKey, t);
  const resourceKeyKind = getResourceKeyKind(resourceKey);

  const { available, max, percentage, used } = getQuotaNumbers(usedValue, maxValue);

  const maxText = getCountText(max, resourceKeyKind, resourceLabel);
  const usedText = getCountText(used, resourceKeyKind, resourceLabel);
  const availableText = getCountText(available, resourceKeyKind, resourceLabel);

  const getTitle = (): string => {
    if (resourceKeyKind === ResourceKeyKind.CPU) {
      return `${percentage.toFixed(0)}%`;
    }
    if (resourceKeyKind === ResourceKeyKind.MEMORY) {
      return usedText;
    }
    return used.toString();
  };

  const title = getTitle();

  const subTitle =
    resourceKeyKind === ResourceKeyKind.COUNT
      ? t('of {{maxText}} used', { maxText })
      : t('of {{maxText}} allocated', { maxText });

  return {
    available,
    availableText,
    max,
    maxText,
    percentage,
    resourceKeyKind,
    resourceLabel,
    subTitle,
    title,
    used,
    usedText,
  };
};
