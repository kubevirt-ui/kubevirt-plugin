import { type TFunction } from 'i18next';

const getSubmitBtnText = (
  isCloneSucceeded: boolean,
  isCloneLoading: boolean,
  isVMSource: boolean,
  t: TFunction,
): string => {
  if (isCloneSucceeded) {
    return t('Close');
  }
  if (isCloneLoading) {
    return t('Cloning');
  }
  return isVMSource ? t('Clone') : t('Create');
};

export default getSubmitBtnText;
