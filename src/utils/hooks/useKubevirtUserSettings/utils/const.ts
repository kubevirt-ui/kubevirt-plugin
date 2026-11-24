/**
 * Legacy shared ConfigMap. It is only ever READ (once, cached) to migrate existing values into
 * the SDK user preferences. It must never be written to: it is shared by all users (CNV-100983).
 */
export const KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME = 'kubevirt-user-settings';

/** Prefix of every user preference key owned by this plugin: `kubevirt.<setting>` */
export const KUBEVIRT_USER_PREFERENCE_PREFIX = 'kubevirt';

export const ACTIONS = 'actions';

export const USER_SETTINGS_KEYS = {
  columns: 'columns',
  columnWidths: 'columnWidths',
  defaultVMLabels: 'defaultVMLabels',
  navigation: 'navigation',
  onboardingPopoversHidden: 'onboardingPopoversHidden',
  quickStart: 'quickStart',
  recentSearches: 'recentSearches',
  savedSearches: 'savedSearches',
  ssh: 'ssh',
} as const;

export const COLUMN_MANAGEMENT_IDS = {
  BOOTABLE_VOLUMES: 'bootable-volumes',
  CHECKUPS_SELF_VALIDATION: 'checkups-self-validation',
  CHECKUPS_STORAGE: 'checkups-storage',
} as const;
