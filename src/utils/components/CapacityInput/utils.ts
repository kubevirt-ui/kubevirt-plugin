import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { decimalUnitsOrdered } from '@kubevirt-utils/utils/unitConstants';
import { binaryUnitsOrdered } from '@kubevirt-utils/utils/unitConstants';
import { QuantityUnit } from '@kubevirt-utils/utils/unitConstants';
import { BinaryUnit } from '@kubevirt-utils/utils/unitConstants';
import { isBinaryUnit, isDecimalUnit } from '@kubevirt-utils/utils/units';

export enum CAPACITY_UNITS {
  GiB = 'GiB',
  MiB = 'MiB',
  TiB = 'TiB',
}

export const getUnitOptions = (unit: QuantityUnit) => {
  const defaultMinIndex = binaryUnitsOrdered.indexOf(BinaryUnit.Mi);
  const defaultMaxIndex = binaryUnitsOrdered.indexOf(BinaryUnit.Ti);
  const unitIndex = isBinaryUnit(unit)
    ? binaryUnitsOrdered.indexOf(unit)
    : decimalUnitsOrdered.indexOf(unit);

  const options: QuantityUnit[] = binaryUnitsOrdered.slice(
    Math.min(defaultMinIndex, unitIndex),
    Math.max(defaultMaxIndex, unitIndex) + 1,
  );

  if (isDecimalUnit(unit)) {
    options.push(unit);
  }

  return options;
};

export const removeByteSuffix = (quantity: string): string => quantity?.replace(/[Bb]/, '');

export const getErrorValue = (value: number) => {
  if (value > 0) {
    return t('less than');
  }
  return value < 0 ? t('negative') : t('zero');
};
