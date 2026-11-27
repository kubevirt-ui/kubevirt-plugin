import type { TFunction } from 'i18next';

export const getDisabledTooltipText = (
  defaultNadError: Error | undefined,
  t: TFunction,
): string | undefined =>
  defaultNadError
    ? t('The project default network must be available before you can continue')
    : undefined;
