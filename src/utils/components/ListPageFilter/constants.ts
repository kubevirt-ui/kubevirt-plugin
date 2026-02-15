export const STATIC_SEARCH_FILTERS = {
  labels: 'labels',
  name: 'name',
} as const;

export const STATIC_SEARCH_FILTERS_LABELS = {
  labels: 'Labels',
  name: 'Name',
} as const;

export const STATIC_SEARCH_FILTERS_PLACEHOLDERS = {
  labels: 'Search by labels...',
  name: 'Search by name...',
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
