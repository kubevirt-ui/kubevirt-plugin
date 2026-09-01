import { type TFunction } from 'i18next';

const getSubmitBtnText = (isCloneLoading: boolean, isVMSource: boolean, t: TFunction): string => {
  if (isCloneLoading) {
    return t('Cloning');
  }
  return isVMSource ? t('Clone') : t('Create');
};

export default getSubmitBtnText;
