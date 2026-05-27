import { act, cleanup, renderHook } from '@testing-library/react';

import {
  NAV_SIDEBAR_COLLAPSED_CLASS,
  NAV_SIDEBAR_SELECTOR,
  NAV_TOGGLE_BUTTON_SELECTORS,
  userExpandedNavSignal,
} from '../constants';
import useAutoHideNavigation from '../useAutoHideNavigation';

const NAV_TOGGLE_ID = NAV_TOGGLE_BUTTON_SELECTORS[0].replace('#', '');

const mockNavigation: { autoHideNav?: boolean } = { autoHideNav: true };
let mockLoaded = true;

jest.mock('@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings', () => ({
  __esModule: true,
  default: () => [mockNavigation, jest.fn(), mockLoaded, undefined],
}));

jest.mock('@preact/signals-react/runtime', () => ({
  useSignals: jest.fn(),
}));

describe('useAutoHideNavigation', () => {
  let mockSidebar: HTMLElement;
  let mockButton: HTMLElement;
  let clickSpy: jest.Mock;

  beforeEach(() => {
    document.body.innerHTML = '';
    userExpandedNavSignal.value = false;
    mockNavigation.autoHideNav = true;
    mockLoaded = true;

    mockSidebar = document.createElement('div');
    mockSidebar.classList.add(NAV_SIDEBAR_SELECTOR.replace('.', ''));
    document.body.appendChild(mockSidebar);

    mockButton = document.createElement('button');
    mockButton.id = NAV_TOGGLE_ID;
    clickSpy = jest.fn();
    mockButton.click = clickSpy;
    document.body.appendChild(mockButton);

    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('collapses sidebar when setting is enabled', () => {
    renderHook(() => useAutoHideNavigation());
    act(() => {
      jest.runAllTimers();
    });

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('does not collapse when setting is disabled', () => {
    mockNavigation.autoHideNav = false;

    renderHook(() => useAutoHideNavigation());
    act(() => {
      jest.runAllTimers();
    });

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('does not collapse when user manually overrode', () => {
    userExpandedNavSignal.value = true;

    renderHook(() => useAutoHideNavigation());
    act(() => {
      jest.runAllTimers();
    });

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('does not collapse when settings are not loaded', () => {
    mockLoaded = false;

    renderHook(() => useAutoHideNavigation());
    act(() => {
      jest.runAllTimers();
    });

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('does not collapse when sidebar is already collapsed', () => {
    mockSidebar.classList.add(NAV_SIDEBAR_COLLAPSED_CLASS);

    renderHook(() => useAutoHideNavigation());
    act(() => {
      jest.runAllTimers();
    });

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('returns true when sidebar was collapsed', () => {
    const { result } = renderHook(() => useAutoHideNavigation());
    act(() => {
      jest.runAllTimers();
    });

    expect(result.current).toBe(true);
  });

  it('returns false when user overrode after collapse', () => {
    const { rerender, result } = renderHook(() => useAutoHideNavigation());
    act(() => {
      jest.runAllTimers();
    });

    expect(result.current).toBe(true);

    act(() => {
      userExpandedNavSignal.value = true;
    });
    rerender();

    expect(result.current).toBe(false);
  });

  it('defaults to enabled when autoHideNav is undefined', () => {
    mockNavigation.autoHideNav = undefined;

    renderHook(() => useAutoHideNavigation());
    act(() => {
      jest.runAllTimers();
    });

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
});
