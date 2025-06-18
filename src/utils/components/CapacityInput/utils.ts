import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export enum CAPACITY_UNITS {
  GiB = 'GiB',
  MiB = 'MiB',
  TiB = 'TiB',
}

export const removeByteSuffix = (quantity: string): string => quantity?.replace(/[Bb]/, '');

export const getErrorValue = (value: number) => {
  if (value > 0) {
    return t('less than');
  }
  return value < 0 ? t('negative') : t('zero');
};
