import { type TFunction } from 'i18next';

import { documentationURL } from '@kubevirt-utils/constants/documentation';

import { CHECKUP_URLS } from '../../utils/constants';
import { type CheckupType } from '../../utils/types';
import { getSelectProjectText } from '../../utils/utils';

export const getTitleText = (checkupType: CheckupType, t: TFunction): string | undefined => {
  if (checkupType === CHECKUP_URLS.STORAGE) {
    return t("You don't have any storage checkups yet");
  }
  if (checkupType === CHECKUP_URLS.SELF_VALIDATION) {
    return t("You don't have any self validation checkups yet");
  }
};

const getRunCheckupText = (checkupType: CheckupType, t: TFunction): string | undefined => {
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
): string | undefined => {
  if (isAllNamespaces) {
    return getSelectProjectText(t);
  }
  if (!isPermitted) {
    return t('To get started, install permissions and then run a checkup');
  }
  return getRunCheckupText(checkupType, t);
};

export const getDocumentationURL = (): string => documentationURL.CHECKUPS;

export const getLearnMoreText = (checkupType: CheckupType, t: TFunction): string | undefined => {
  if (checkupType === CHECKUP_URLS.STORAGE) {
    return t('Learn more about storage checkups');
  }
  if (checkupType === CHECKUP_URLS.SELF_VALIDATION) {
    return t('Learn more about self validation checkups');
  }
};
