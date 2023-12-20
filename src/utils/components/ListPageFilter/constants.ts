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

const KEYBOARD_SHORTCUTS = {
  blurFilterInput: 'Escape',
  focusFilterInput: '/',
  focusNamespaceDropdown: 'n',
};

export enum KeyEventModes {
  FOCUS = 'FOCUS',
  HIDE = 'HIDE',
}

export const textInputKeyHandler = {
  [KEYBOARD_SHORTCUTS.blurFilterInput]: KeyEventModes.HIDE,
  [KEYBOARD_SHORTCUTS.focusFilterInput]: KeyEventModes.FOCUS,
};

export const suggestionBoxKeyHandler = {
  Escape: KeyEventModes.HIDE,
};

export type KeyEventMap = {
  [key: string]: KeyEventModes;
};
