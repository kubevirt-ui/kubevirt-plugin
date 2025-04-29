import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export enum CAPACITY_UNITS {
  GiB = 'GiB',
  MiB = 'MiB',
  TiB = 'TiB',
}

export const removeByteSuffix = (quantity: string): string => quantity?.replace(/[Bb]/, '');

export const getValueFromSize = (size: string) => {
  const [sizeValue = 0] = size?.replace(/,/g, '').match(/[0-9]+/g) || [];
  return Number(sizeValue);
};

export const getUnitFromSize = (size: string) => {
  const [unitValue = ''] = size?.match(/[a-zA-Z]+/g) || [];
  return (!unitValue?.endsWith('B') ? `${unitValue}B` : unitValue) as CAPACITY_UNITS;
};

export const getErrorValue = (value: number) => {
  if (value > 0) {
    return t('less than');
  }
  return value < 0 ? t('negative') : t('zero');
};
