import { CONSOLE_NAMESPACE_BOOKMARKS_KEY } from '@kubevirt-utils/hooks/useConsoleNamespaceBookmarks/consts';
import { act, renderHook, waitFor } from '@testing-library/react';

import { TEST_FAVORITE_BOOKMARKS } from '../tests/constants';
import { CONSOLE_USER_SETTINGS } from '../useConsoleUserSettingLocalStorage/consts';

import useConsoleBookmarks from './useConsoleBookmarks';

jest.mock(
  '@kubevirt-utils/hooks/useConsoleUserSettingsConfigMap/useConsoleUserSettingsConfigMap',
  () => ({
    __esModule: true,
    default: () => {
      const { USER_SETTINGS_CONFIG_MAP_NAME: configMapName } = require('../tests/constants');
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

jest.mock('../useConsoleUserSettingsCluster/useConsoleUserSettingsCluster', () => ({
  __esModule: true,
  default: () => undefined,
}));

describe('useConsoleBookmarks', () => {
  beforeEach(() => {
    localStorage.clear();
    window.SERVER_FLAGS = {
      authDisabled: false,
      branding: 'okd',
      userSettingsLocation: CONSOLE_USER_SETTINGS.LOCATION.LOCALSTORAGE,
    };
  });

  it('loads bookmarks from localStorage', async () => {
    localStorage.setItem(
      CONSOLE_USER_SETTINGS.LOCAL_STORAGE_KEY,
      JSON.stringify({
        [CONSOLE_NAMESPACE_BOOKMARKS_KEY]: TEST_FAVORITE_BOOKMARKS,
      }),
    );

    const { result } = renderHook(() => useConsoleBookmarks(CONSOLE_NAMESPACE_BOOKMARKS_KEY));

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    expect(result.current[0]).toEqual(TEST_FAVORITE_BOOKMARKS);
  });

  it('keeps optimistic bookmarks visible until persisted state matches', async () => {
    const { result } = renderHook(() => useConsoleBookmarks(CONSOLE_NAMESPACE_BOOKMARKS_KEY));

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    await act(async () => {
      await result.current[1](TEST_FAVORITE_BOOKMARKS);
    });

    expect(result.current[0]).toEqual(TEST_FAVORITE_BOOKMARKS);
  });

  it('coalesces rapid bookmark updates to the latest value', async () => {
    const { result } = renderHook(() => useConsoleBookmarks(CONSOLE_NAMESPACE_BOOKMARKS_KEY));

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    await act(async () => {
      const firstWrite = result.current[1]({ first: true });
      const secondWrite = result.current[1]({ second: true });
      await Promise.all([firstWrite, secondWrite]);
    });

    expect(result.current[0]).toEqual({ second: true });
    expect(
      JSON.parse(localStorage.getItem(CONSOLE_USER_SETTINGS.LOCAL_STORAGE_KEY) || '{}'),
    ).toEqual({
      [CONSOLE_NAMESPACE_BOOKMARKS_KEY]: { second: true },
    });
  });
});
