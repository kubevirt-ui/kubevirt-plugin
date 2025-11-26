import { TFunction } from 'react-i18next';

import CheckupsNetworkList from '../network/list/CheckupsNetworkList';
import CheckupsSelfValidationList from '../self-validation/list/CheckupsSelfValidationList';
import CheckupsStorageList from '../storage/list/CheckupsStorageList';

import { CHECKUP_URLS } from './constants';

export const getCheckUpTabs = (t: TFunction) => [
  {
    component: CheckupsNetworkList,
    href: CHECKUP_URLS.NETWORK,
    name: t('Network latency'),
  },
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
