import { CONSOLE_USER_SETTINGS } from '@kubevirt-utils/hooks/consoleUserSettings/useConsoleUserSettingLocalStorage/consts';
import { act, renderHook, waitFor } from '@testing-library/react';

import { CONSOLE_NAMESPACE_SYSTEM_NAMESPACE_KEY } from './consts';
import useConsoleShowSystemNamespaces from './useConsoleShowSystemNamespaces';

jest.mock(
  '@kubevirt-utils/hooks/useConsoleUserSettingsConfigMap/useConsoleUserSettingsConfigMap',
  () => ({
    __esModule: true,
    default: () => {
      const {
        USER_SETTINGS_CONFIG_MAP_NAME: configMapName,
      } = require('@kubevirt-utils/hooks/consoleUserSettings/tests/constants');
      return {
        configMapError: undefined,
        configMapName,
        errorUser: undefined,
        loadedConfigMap: true,
        loadedUser: true,
        userConfigMap: undefined,
        userName: configMapName,
      };
    },
  }),
);

jest.mock(
  '@kubevirt-utils/hooks/consoleUserSettings/useConsoleUserSettingsCluster/useConsoleUserSettingsCluster',
  () => ({
    __esModule: true,
    default: () => undefined,
  }),
);

describe('useConsoleShowSystemNamespaces', () => {
  beforeEach(() => {
    localStorage.clear();
    window.SERVER_FLAGS = {
      authDisabled: false,
      branding: 'okd',
      userSettingsLocation: CONSOLE_USER_SETTINGS.LOCATION.LOCALSTORAGE,
    };
  });

  it('loads the initial toggle value from localStorage', async () => {
    localStorage.setItem(
      CONSOLE_USER_SETTINGS.LOCAL_STORAGE_KEY,
      JSON.stringify({
        [CONSOLE_NAMESPACE_SYSTEM_NAMESPACE_KEY]: true,
      }),
    );

    const { result } = renderHook(() => useConsoleShowSystemNamespaces());

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    expect(result.current[0]).toBe(true);
  });

  it('updates optimistically when toggled', async () => {
    const { result } = renderHook(() => useConsoleShowSystemNamespaces());

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    act(() => {
      void result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
  });

  it('keeps toggle and persisted value aligned after rapid toggles', async () => {
    const { result } = renderHook(() => useConsoleShowSystemNamespaces());

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    await act(async () => {
      const firstToggle = result.current[1](true);
      const secondToggle = result.current[1](false);
      const thirdToggle = result.current[1](true);
      await Promise.all([firstToggle, secondToggle, thirdToggle]);
    });

    await waitFor(() => {
      expect(result.current[0]).toBe(true);
    });

    expect(
      JSON.parse(localStorage.getItem(CONSOLE_USER_SETTINGS.LOCAL_STORAGE_KEY) || '{}'),
    ).toEqual({
      [CONSOLE_NAMESPACE_SYSTEM_NAMESPACE_KEY]: true,
    });
  });

  it('reverts optimistic state when a write fails', async () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    const { result } = renderHook(() => useConsoleShowSystemNamespaces());

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    await act(async () => {
      await expect(result.current[1](true)).rejects.toThrow('quota exceeded');
    });

    expect(result.current[0]).toBe(false);

    setItemSpy.mockRestore();
  });
});
