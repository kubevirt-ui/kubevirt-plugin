import {
  NAV_SIDEBAR_COLLAPSED_CLASS,
  NAV_SIDEBAR_SELECTOR,
  NAV_TOGGLE_BUTTON_SELECTORS,
} from '../constants';
import { collapseSidebar, expandSidebar, getNavToggleButton, isSidebarOpen } from '../utils';

const NAV_TOGGLE_ID = NAV_TOGGLE_BUTTON_SELECTORS[0].replace('#', '');

describe('useAutoHideNavigation utils', () => {
  let mockSidebar: HTMLElement;
  let mockButton: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';

    mockSidebar = document.createElement('div');
    mockSidebar.classList.add(NAV_SIDEBAR_SELECTOR.replace('.', ''));
    document.body.appendChild(mockSidebar);

    mockButton = document.createElement('button');
    mockButton.id = NAV_TOGGLE_ID;
    mockButton.onclick = jest.fn();
    document.body.appendChild(mockButton);
  });

  describe('getNavToggleButton', () => {
    it('returns the toggle button when found by id', () => {
      expect(getNavToggleButton()).toBe(mockButton);
    });

    it('returns null when no matching element exists', () => {
      mockButton.remove();
      expect(getNavToggleButton()).toBeNull();
    });

    it('falls back to alternative selectors', () => {
      mockButton.remove();
      const altButton = document.createElement('button');
      altButton.setAttribute('data-test', 'nav-toggle');
      document.body.appendChild(altButton);

      expect(getNavToggleButton()).toBe(altButton);
    });
  });

  describe('isSidebarOpen', () => {
    it('returns true when sidebar exists without collapsed class', () => {
      expect(isSidebarOpen()).toBe(true);
    });

    it('returns false when sidebar has collapsed class', () => {
      mockSidebar.classList.add(NAV_SIDEBAR_COLLAPSED_CLASS);
      expect(isSidebarOpen()).toBe(false);
    });

    it('returns false when sidebar does not exist', () => {
      mockSidebar.remove();
      expect(isSidebarOpen()).toBe(false);
    });
  });

  describe('collapseSidebar', () => {
    it('clicks the toggle button when sidebar is open', () => {
      const clickSpy = jest.fn();
      mockButton.click = clickSpy;

      const result = collapseSidebar();

      expect(result).toBe(true);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('returns false when sidebar is already collapsed', () => {
      mockSidebar.classList.add(NAV_SIDEBAR_COLLAPSED_CLASS);
      const clickSpy = jest.fn();
      mockButton.click = clickSpy;

      const result = collapseSidebar();

      expect(result).toBe(false);
      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('returns false when toggle button is not found', () => {
      mockButton.remove();

      const result = collapseSidebar();

      expect(result).toBe(false);
    });
  });

  describe('expandSidebar', () => {
    it('clicks the toggle button when sidebar is collapsed', () => {
      mockSidebar.classList.add(NAV_SIDEBAR_COLLAPSED_CLASS);
      const clickSpy = jest.fn();
      mockButton.click = clickSpy;

      const result = expandSidebar();

      expect(result).toBe(true);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('returns false when sidebar is already open', () => {
      const clickSpy = jest.fn();
      mockButton.click = clickSpy;

      const result = expandSidebar();

      expect(result).toBe(false);
      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('returns false when toggle button is not found', () => {
      mockSidebar.classList.add(NAV_SIDEBAR_COLLAPSED_CLASS);
      mockButton.remove();

      const result = expandSidebar();

      expect(result).toBe(false);
    });
  });
});
