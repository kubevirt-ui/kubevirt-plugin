import { signal } from '@preact/signals-react';

export const NAV_SIDEBAR_SELECTOR = '.pf-v6-c-page__sidebar';
export const NAV_SIDEBAR_COLLAPSED_CLASS = 'pf-m-collapsed';
export const NAV_TOGGLE_BUTTON_SELECTORS = [
  '#nav-toggle',
  'button.pf-v6-c-masthead__toggle',
  '.pf-v6-c-masthead__toggle button',
];

export const AUTO_HIDE_NAV_DEFAULT = true;

export const userExpandedNavSignal = signal(false);
