import type { TFunction } from 'i18next';

export const getDisabledTooltipText = (
  hasProject: boolean,
  isVmNameValid: boolean,
  t: TFunction,
  vmName?: string,
): string => {
  if (!hasProject) {
    return t('Select a project before continuing');
  }

  if (!isVmNameValid) {
    return vmName ? t('VM name is not valid') : t('VM name is required');
  }

  return t('Complete all required fields');
};
