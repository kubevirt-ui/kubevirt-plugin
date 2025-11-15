import React from 'react';
import { TFunction } from 'react-i18next';

import CheckupsNetworkList from '../network/list/CheckupsNetworkList';
import CheckupsSelfValidationList from '../self-validation/list/CheckupsSelfValidationList';
import CheckupsStorageList from '../storage/list/CheckupsStorageList';

import { CHECKUP_URLS } from './constants';

export const getCheckUpTabs = (t: TFunction) => [
  {
    component: <CheckupsNetworkList />,
    eventKey: 0,
    title: t('Network latency'),
    url: CHECKUP_URLS.NETWORK,
  },
  {
    component: <CheckupsStorageList />,
    eventKey: 1,
    title: t('Storage'),
    url: CHECKUP_URLS.STORAGE,
  },
  {
    component: <CheckupsSelfValidationList />,
    eventKey: 2,
    title: t('Self Validation'),
    url: CHECKUP_URLS.SELF_VALIDATION,
  },
];
