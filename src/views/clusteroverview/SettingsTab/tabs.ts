import { TFunction } from 'react-i18next';

import ClusterTab from './ClusterTab/ClusterTab';
import PreviewFeaturesTab from './PreviewFeaturesTab/PreviewFeaturesTab';
import UserTab from './UserTab/UserTab';

export const SETTINGS_TABS = {
  CLUSTER: 'cluster',
  FEATURES: 'features',
  USER: 'user',
} as const;

export type SettingsTab = typeof SETTINGS_TABS[keyof typeof SETTINGS_TABS];

export const SETTINGS_TABS_ARRAY: SettingsTab[] = Object.values(SETTINGS_TABS);

export const getTabs = (isAdmin: boolean, t: TFunction) => [
  ...(isAdmin
    ? [
        {
          Component: ClusterTab,
          dataTest: 'cluster-settings',
          name: SETTINGS_TABS.CLUSTER,
          title: t('Cluster'),
        },
      ]
    : []),
  {
    Component: UserTab,
    dataTest: 'user-settings',
    name: SETTINGS_TABS.USER,
    title: t('User'),
  },
  {
    Component: PreviewFeaturesTab,
    dataTest: 'preview-features',
    name: SETTINGS_TABS.FEATURES,
    title: t('Preview features'),
  },
];
