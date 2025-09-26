import { idIsHighlighted } from '@kubevirt-utils/components/SearchItem/useIsHighlighted';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  SearchItem,
  SearchItemGetter,
  SearchItemWithTab,
} from '@virtualmachines/details/tabs/configuration/utils/search';

import {
  CLUSTER_TAB_IDS,
  PREVIEW_FEATURES_TAB_IDS,
  SEARCH_ITEM_CHILDREN_TREE,
  USER_TAB_IDS,
} from './constants';

export const getClusterTabIds: SearchItemGetter = () => [
  { id: CLUSTER_TAB_IDS.virtualizationFeatures, title: t('Virtualization features') },
  { id: CLUSTER_TAB_IDS.generalSettings, title: t('General settings') },
  { id: CLUSTER_TAB_IDS.liveMigration, title: t('Live migration') },
  { id: CLUSTER_TAB_IDS.memoryDensity, title: t('Memory density') },
  { id: CLUSTER_TAB_IDS.sshConfiguration, title: t('SSH configuration') },
  { id: CLUSTER_TAB_IDS.templatesManagement, title: t('Templates and images management') },
  { id: CLUSTER_TAB_IDS.automaticImagesDownload, title: t('Automatic images download') },
  { id: CLUSTER_TAB_IDS.bootableVolumesProject, title: t('Bootable volumes project') },
  { id: CLUSTER_TAB_IDS.templatesProject, title: t('Templates project') },
  { id: CLUSTER_TAB_IDS.vmActionsConfirmation, title: t('VirtualMachine actions confirmation') },
  { id: CLUSTER_TAB_IDS.guestManagement, title: t('Guest management') },
  { id: CLUSTER_TAB_IDS.resourceManagement, title: t('Resource management') },
  { id: CLUSTER_TAB_IDS.persistentReservation, title: t('Persistent reservation') },
];

export const getUserTabIds: SearchItemGetter = () => [
  { id: USER_TAB_IDS.sshKeys, title: t('SSH keys') },
  { id: USER_TAB_IDS.permissions, title: t('Permissions') },
  { id: USER_TAB_IDS.gettingStarted, title: t('Getting started') },
];

export const getPreviewFeaturesTabIds: SearchItemGetter = () => [
  { id: PREVIEW_FEATURES_TAB_IDS.previewFeatures, title: t('Preview features') },
];

const tabsIds: { [key: string]: SearchItem[] } = {
  cluster: getClusterTabIds(),
  features: getPreviewFeaturesTabIds(),
  user: getUserTabIds(),
};

export const SEARCH_ITEMS: SearchItemWithTab[] = Object.entries(tabsIds)
  .map(([tab, value]) => value.map((element) => ({ element, tab })))
  .flat()
  .sort((a, b) => a.element.title.localeCompare(b.element.title));

export const createSettingsSearchURL = (
  tab: string,
  elementId: string,
  pathname: string,
): string => {
  const index = pathname?.lastIndexOf('settings');
  const substr = pathname.slice(0, index);
  return substr + `settings/${tab}#${elementId}`;
};

export const isSearchItemChildrenHighlighted = (itemId: string, hash: string): boolean => {
  const childrenIds = SEARCH_ITEM_CHILDREN_TREE[itemId];

  if (!childrenIds) return false;

  return childrenIds.some(
    (id) => idIsHighlighted(id, hash) || isSearchItemChildrenHighlighted(id, hash),
  );
};
