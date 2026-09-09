import { getI18n, useTranslation, type UseTranslationResponse } from 'react-i18next';
import { type TOptions } from 'i18next';

/**
 * A Hook for using the i18n translation.
 */
export const useKubevirtTranslation = (): UseTranslationResponse<
  'plugin__kubevirt-plugin',
  undefined
> => useTranslation('plugin__kubevirt-plugin');

/**
 * a function to perform translation to 'plugin__kubevirt-plugin' namespace
 * @param value string to translate
 * @param options (optional) options for traslations
 */
// skipcq: JS-C1002
export const t = (value: string, options?: TOptions): string =>
  getI18n().t(value, { ns: 'plugin__kubevirt-plugin', ...options });
