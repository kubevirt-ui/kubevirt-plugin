import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { convertToBaseValue } from '@kubevirt-utils/utils/humanize.js';
import { getHumanizedSize } from '@kubevirt-utils/utils/units';
import { SortByDirection } from '@patternfly/react-table';

type InstancetypeMemorySource = {
  spec?: {
    memory?: {
      guest?: number | string;
    };
  };
};

export const getInstancetypeMemoryDisplayValue = (
  instancetype: InstancetypeMemorySource,
): string => {
  const memory = instancetype?.spec?.memory?.guest;
  if (!memory) {
    return NO_DATA_DASH;
  }

  return getHumanizedSize(String(memory))?.string ?? NO_DATA_DASH;
};

export const getInstancetypeMemorySortValue = (instancetype: InstancetypeMemorySource): number => {
  const memory = instancetype?.spec?.memory?.guest;
  if (!memory) {
    return 0;
  }

  return convertToBaseValue(String(memory)) ?? 0;
};

export const sortByInstancetypeMemory = <T extends InstancetypeMemorySource>(
  data: T[],
  direction: SortByDirection,
): T[] =>
  [...data].sort((a, b) => {
    const cmp = getInstancetypeMemorySortValue(a) - getInstancetypeMemorySortValue(b);
    return direction === SortByDirection.asc ? cmp : -cmp;
  });
