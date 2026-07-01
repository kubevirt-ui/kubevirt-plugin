import { CAPACITY_UNITS } from '@kubevirt-utils/components/CapacityInput/utils';
import { createCPUQueryValue, createMemoryQueryValue } from '@search/utils/query';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { MEMORY_VALUE_REGEX, SIGN_TO_OPERATOR } from '../constants';

const normalizeMemoryUnit = (unit: string): CAPACITY_UNITS | undefined => {
  const lower = unit.toLowerCase();
  return Object.values(CAPACITY_UNITS).find((u) => u.toLowerCase() === lower);
};

export const formatNumericValue = (
  key: string,
  operatorSign: string,
  rawValue: string,
): null | string => {
  const operatorEnum = SIGN_TO_OPERATOR[operatorSign];
  if (!operatorEnum) return null;

  if (key === VirtualMachineRowFilterType.Memory) {
    const match = rawValue.match(MEMORY_VALUE_REGEX);
    if (!match) return null;

    const [, numStr, unit] = match;
    const normalizedUnit = normalizeMemoryUnit(unit);
    if (!normalizedUnit) return null;

    return createMemoryQueryValue(operatorEnum, Number(numStr), normalizedUnit);
  }

  const num = Number(rawValue);
  if (isNaN(num)) return null;

  return createCPUQueryValue(operatorEnum, num);
};
