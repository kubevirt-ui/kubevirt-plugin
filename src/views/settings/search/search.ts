import { type TFunction } from 'i18next';

import { idIsHighlighted } from '@kubevirt-utils/components/SearchItem/useIsHighlighted';
import { VIRTUALIZATION_PATHS } from '@kubevirt-utils/constants/constants';
import {
  type SearchItem,
  type SearchItemWithTab,
} from '@virtualmachines/details/tabs/configuration/utils/search';

import {
  CLUSTER_TAB_IDS,
  PREVIEW_FEATURES_TAB_IDS,
  RECOMMENDED_TAB_IDS,
  SEARCH_ITEM_CHILDREN_TREE,
  USER_TAB_IDS,
} from './constants';

export const getClusterTabIds = (t: TFunction): SearchItem[] => [
  { id: CLUSTER_TAB_IDS.virtualizationFeatures, title: t('Virtualization features') },
  { id: CLUSTER_TAB_IDS.generalSettings, title: t('General settings') },
  { id: CLUSTER_TAB_IDS.liveMigration, title: t('Live migration') },
  { id: CLUSTER_TAB_IDS.memoryDensity, title: t('Memory request ratio') },
  { id: CLUSTER_TAB_IDS.sshConfiguration, title: t('SSH configuration') },
  { id: CLUSTER_TAB_IDS.templatesManagement, title: t('Templates and images management') },
  { id: CLUSTER_TAB_IDS.automaticImagesDownload, title: t('Automatic images download') },
  {
    id: CLUSTER_TAB_IDS.automaticSubscriptionRhel,
    title: t('Automatic subscription of new RHEL VirtualMachines'),
  },
  { id: CLUSTER_TAB_IDS.bootableVolumesProject, title: t('Bootable volumes project') },
  { id: CLUSTER_TAB_IDS.templatesProject, title: t('Templates project') },
  { id: CLUSTER_TAB_IDS.vmActionsConfirmation, title: t('VirtualMachine actions confirmation') },
  { id: CLUSTER_TAB_IDS.hideYamlTab, title: t('Hide YAML tab') },
  { id: CLUSTER_TAB_IDS.advancedCDROMFeatures, title: t('Advanced CD-ROM features') },
  { id: CLUSTER_TAB_IDS.guestManagement, title: t('Guest management') },
  { id: CLUSTER_TAB_IDS.loadBalance, title: t('Load balance') },
  { id: CLUSTER_TAB_IDS.resourceManagement, title: t('Resource management') },
  { id: CLUSTER_TAB_IDS.persistentReservation, title: t('Persistent reservation') },
];

const getUserTabIds = (t: TFunction): SearchItem[] => [
  { id: USER_TAB_IDS.general, title: t('General') },
  { id: USER_TAB_IDS.autoHideNav, title: t('Auto-hide navigation menu') },
  { id: USER_TAB_IDS.sshKeys, title: t('SSH keys') },
  { id: USER_TAB_IDS.permissions, title: t('Permissions') },
  { id: USER_TAB_IDS.gettingStarted, title: t('Getting started') },
  { id: USER_TAB_IDS.welcomeInformation, title: t('Welcome information') },
  { id: USER_TAB_IDS.guidedTour, title: t('Guided tour') },
];

const getRecommendedTabIds = (t: TFunction): SearchItem[] => [
  { id: RECOMMENDED_TAB_IDS.recommendedCapabilities, title: t('Recommended capabilities') },
];

const getPreviewFeaturesTabIds = (t: TFunction): SearchItem[] => [
  { id: PREVIEW_FEATURES_TAB_IDS.previewFeatures, title: t('Preview features') },
  {
    id: PREVIEW_FEATURES_TAB_IDS.treeViewFolders,
    title: t('Enable groups in VirtualMachines tree view'),
  },
  {
    id: PREVIEW_FEATURES_TAB_IDS.passtUDNNetwork,
    title: t('Enable Passt binding for primary user-defined networks'),
  },
  {
    id: PREVIEW_FEATURES_TAB_IDS.vmTemplates,
    // Shown only on HCO v1beta1; HCO v1 hides the Preview Features toggle.
    title: t('Enable native VirtualMachine templates'),
  },
  {
    id: PREVIEW_FEATURES_TAB_IDS.controlDefaultVirtualizationPermissions,
    title: t('Control default Virtualization permissions'),
  },
];

export const getSearchItems = (t: TFunction): SearchItemWithTab[] => {
  const tabsIds: { [key: string]: SearchItem[] } = {
    cluster: getClusterTabIds(t),
    features: getPreviewFeaturesTabIds(t),
    recommended: getRecommendedTabIds(t),
    user: getUserTabIds(t),
  };

  return Object.entries(tabsIds)
    .map(([tab, value]) => value.map((element) => ({ element, tab })))
    .flat()
    .sort((a, b) => a.element.title.localeCompare(b.element.title));
};

export const createSettingsSearchURL = (
  tab: string,
  elementId: string,
  pathname: string,
): string => {
  const settingsPath = VIRTUALIZATION_PATHS.SETTINGS;
  const index = pathname.lastIndexOf(settingsPath);
  const prefix =
    index === -1 ? pathname.substring(0, pathname.lastIndexOf('/') + 1) : pathname.slice(0, index);
  return `${prefix}${settingsPath}/${tab}#${elementId}`;
};

export const isSearchItemChildrenHighlighted = (itemId: string, hash: string): boolean => {
  const childrenIds = SEARCH_ITEM_CHILDREN_TREE[itemId];

  if (!childrenIds) return false;

  return childrenIds.some(
    (childId) => idIsHighlighted(childId, hash) || isSearchItemChildrenHighlighted(childId, hash),
  );
};
