import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export const STATIC_SEARCH_FILTERS = {
  labels: 'labels',
  name: 'name',
} as const;

export const STATIC_SEARCH_FILTERS_LABELS = {
  labels: t('Labels'),
  name: t('Name'),
} as const;

export const STATIC_SEARCH_FILTERS_PLACEHOLDERS = {
  labels: t('Search by labels...'),
  name: t('Search by name...'),
} as const;

export const MAX_SUGGESTIONS = 5;
