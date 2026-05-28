import {
  NAV_SIDEBAR_COLLAPSED_CLASS,
  NAV_SIDEBAR_SELECTOR,
  NAV_TOGGLE_BUTTON_SELECTORS,
} from './constants';

export const getNavToggleButton = (): HTMLElement | null => {
  for (const selector of NAV_TOGGLE_BUTTON_SELECTORS) {
    const button = document.querySelector<HTMLElement>(selector);
    if (button) return button;
  }
  return null;
};

export const isSidebarOpen = (): boolean => {
  const sidebar = document.querySelector(NAV_SIDEBAR_SELECTOR);
  return !!sidebar && !sidebar.classList.contains(NAV_SIDEBAR_COLLAPSED_CLASS);
};

export const collapseSidebar = (): boolean => {
  if (!isSidebarOpen()) return false;

  const toggleButton = getNavToggleButton();
  if (!toggleButton) return false;

  toggleButton.click();
  return true;
};

export const expandSidebar = (): boolean => {
  if (isSidebarOpen()) return false;

  const toggleButton = getNavToggleButton();
  if (!toggleButton) return false;

  toggleButton.click();
  return true;
};
