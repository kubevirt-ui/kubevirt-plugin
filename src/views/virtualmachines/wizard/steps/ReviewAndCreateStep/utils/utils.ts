import { TFunction } from 'i18next';

export const getCreateButtonText = (
  isCloneMethod: boolean,
  isSubmitting: boolean,
  t: TFunction,
): string => {
  if (isCloneMethod) {
    return isSubmitting ? t('Cloning VirtualMachine') : t('Clone VirtualMachine');
  }
  return isSubmitting ? t('Creating VirtualMachine') : t('Create VirtualMachine');
};
