import { type TFunction } from 'i18next';

import {
  BinaryUnit,
  binaryUnitsOrdered,
  decimalUnitsOrdered,
  type QuantityUnit,
} from '@kubevirt-utils/utils/unitConstants';
import {
  extractNumberFromQuantityString,
  isBinaryUnit,
  isDecimalUnit,
} from '@kubevirt-utils/utils/units';

export enum CAPACITY_UNITS {
  GiB = 'GiB',
  MiB = 'MiB',
  TiB = 'TiB',
}

export const capacityUnitsOrdered = [CAPACITY_UNITS.MiB, CAPACITY_UNITS.GiB, CAPACITY_UNITS.TiB];

export const getUnitOptions = (unit: QuantityUnit): QuantityUnit[] => {
  const defaultMinIndex: number = binaryUnitsOrdered.indexOf(BinaryUnit.Mi);
  const defaultMaxIndex: number = binaryUnitsOrdered.indexOf(BinaryUnit.Ti);
  const unitIndex: number = isBinaryUnit(unit)
    ? binaryUnitsOrdered.indexOf(unit)
    : decimalUnitsOrdered.indexOf(unit);

  const options: QuantityUnit[] = binaryUnitsOrdered.slice(
    Math.min(defaultMinIndex, unitIndex),
    Math.max(defaultMaxIndex, unitIndex) + 1,
  );

  // we don't want to have 'B' option twice
  if (isDecimalUnit(unit) && unit !== 'B') {
    options.push(unit);
  }

  return options;
};

export const getErrorValue = (t: TFunction, value: number): string => {
  if (value > 0) {
    return t('less than');
  }
  return value < 0 ? t('negative') : t('zero');
};

export const getIsMinusDisabled = (minValue: number | undefined, currentValue: string): boolean => {
  return minValue
    ? Math.ceil(minValue) >= extractNumberFromQuantityString(currentValue) || !currentValue
    : false;
};
