import { TFunction } from 'react-i18next';

import CheckupsSelfValidationList from '../self-validation/list/CheckupsSelfValidationList';
import CheckupsStorageList from '../storage/list/CheckupsStorageList';

import { CHECKUP_URLS } from './constants';
import { TabConfig } from './types';

export const getCheckUpTabs = (t: TFunction): TabConfig[] => [
  {
    component: CheckupsStorageList,
    href: CHECKUP_URLS.STORAGE,
    name: t('Storage'),
  },
  {
    component: CheckupsSelfValidationList,
    href: CHECKUP_URLS.SELF_VALIDATION,
    name: t('Self validation'),
  },
];
