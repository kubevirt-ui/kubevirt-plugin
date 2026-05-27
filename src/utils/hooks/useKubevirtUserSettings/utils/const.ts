export const TOP_CONSUMERS_CARD = 'topConsumersCard';

export const KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME = 'kubevirt-user-settings';

export const ACTIONS = 'actions';

export const USER_SETTINGS_KEYS = {
  cards: 'cards',
  columns: 'columns',
  favoriteBootableVolumes: 'favoriteBootableVolumes',
  navigation: 'navigation',
  onboardingPopoversHidden: 'onboardingPopoversHidden',
  quickStart: 'quickStart',
  savedSearches: 'savedSearches',
  ssh: 'ssh',
} as const;

export const COLUMN_MANAGEMENT_IDS = {
  BOOTABLE_VOLUMES: 'bootable-volumes',
  CHECKUPS_SELF_VALIDATION: 'checkups-self-validation',
  CHECKUPS_STORAGE: 'checkups-storage',
} as const;
