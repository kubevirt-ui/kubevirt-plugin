import { TFunction } from 'react-i18next';

import { documentationURL } from '@kubevirt-utils/constants/documentation';

import { CHECKUP_URLS } from '../../utils/constants';
import { CheckupType } from '../../utils/types';
import { getSelectProjectText } from '../../utils/utils';

export const getTitleText = (checkupType: CheckupType, t: TFunction) => {
  if (checkupType === CHECKUP_URLS.STORAGE) {
    return t('No storage checkups found');
  }
  if (checkupType === CHECKUP_URLS.SELF_VALIDATION) {
    return t('No self validation checkups found');
  }
};

const getRunCheckupText = (checkupType: CheckupType, t: TFunction) => {
  if (checkupType === CHECKUP_URLS.STORAGE) {
    return t('To get started, run a storage checkup');
  }
  if (checkupType === CHECKUP_URLS.SELF_VALIDATION) {
    return t('To get started, run a self validation checkup');
  }
};

export const getBodyText = (
  checkupType: CheckupType,
  isAllNamespaces: boolean,
  isPermitted: boolean,
  t: TFunction,
) => {
  if (isAllNamespaces) {
    return getSelectProjectText(t);
  }
  if (!isPermitted) {
    return t('To get started, install permissions and then run a checkup');
  }
  return getRunCheckupText(checkupType, t);
};

export const getDocumentationURL = () => {
  return documentationURL.CHECKUPS;
};

export const getLearnMoreText = (checkupType: CheckupType, t: TFunction) => {
  if (checkupType === CHECKUP_URLS.STORAGE) {
    return t('Learn more about storage checkups');
  }
  if (checkupType === CHECKUP_URLS.SELF_VALIDATION) {
    return t('Learn more about self validation checkups');
  }
};
