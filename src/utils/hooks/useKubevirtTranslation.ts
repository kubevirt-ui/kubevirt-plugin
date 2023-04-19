import { getI18n, useTranslation } from 'react-i18next';

/**
 * A Hook for using the i18n translation.
 */
export const useKubevirtTranslation = () => useTranslation('plugin__kubevirt-plugin');

/**
 * a function to perform translation to 'plugin__kubevirt-plugin' namespace
 */
// skipcq: JS-C1002
export const t = getI18n().t;
