import { ResourceKeyKind } from 'src/views/quotas/details/types';
import { DANGER_THRESHOLD, WARNING_THRESHOLD } from 'src/views/quotas/utils/constants';

import { humanizeCpuCores } from '@kubevirt-utils/utils/humanize.js';
import { getHumanizedSize } from '@kubevirt-utils/utils/units';
import { ProgressVariant } from '@patternfly/react-core';

export const getProgressVariant = (percentage: number) => {
  if (percentage >= DANGER_THRESHOLD) {
    return ProgressVariant.danger;
  }
  if (percentage >= WARNING_THRESHOLD) {
    return ProgressVariant.warning;
  }
  return ProgressVariant.success;
};

export const getCountString = (count: number, type: ResourceKeyKind): string => {
  if (type === ResourceKeyKind.CPU) {
    return `${humanizeCpuCores(count).string}`;
  }
  if (type === ResourceKeyKind.MEMORY) {
    return getHumanizedSize(`${count}`, 'withB', 'GiB').value;
  }
  return `${count}`;
};
