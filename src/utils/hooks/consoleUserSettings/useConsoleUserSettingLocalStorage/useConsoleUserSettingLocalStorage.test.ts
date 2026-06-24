import { CONSOLE_NAMESPACE_SYSTEM_NAMESPACE_KEY } from '@kubevirt-utils/hooks/useConsoleShowSystemNamespaces/consts';
import { act, renderHook, waitFor } from '@testing-library/react';

import { CONSOLE_USER_SETTINGS } from './consts';
import useConsoleUserSettingLocalStorage from './useConsoleUserSettingLocalStorage';
import { parseStoredBooleanUserPreference } from './utils';

describe('useConsoleUserSettingLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    window.SERVER_FLAGS = {
      authDisabled: false,
      branding: 'okd',
      userSettingsLocation: CONSOLE_USER_SETTINGS.LOCATION.LOCALSTORAGE,
    };
  });

  it('loads the initial value from localStorage', async () => {
    localStorage.setItem(
      CONSOLE_USER_SETTINGS.LOCAL_STORAGE_KEY,
      JSON.stringify({
        [CONSOLE_NAMESPACE_SYSTEM_NAMESPACE_KEY]: true,
      }),
    );

    const { result } = renderHook(() =>
      useConsoleUserSettingLocalStorage(
        CONSOLE_NAMESPACE_SYSTEM_NAMESPACE_KEY,
        parseStoredBooleanUserPreference,
        false,
      ),
    );

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });
    expect(result.current[0]).toBe(true);
  });

  it('persists updates to localStorage', async () => {
    const { result } = renderHook(() =>
      useConsoleUserSettingLocalStorage(
        CONSOLE_NAMESPACE_SYSTEM_NAMESPACE_KEY,
        parseStoredBooleanUserPreference,
        false,
      ),
    );

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    await act(async () => {
      await result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
    expect(
      JSON.parse(localStorage.getItem(CONSOLE_USER_SETTINGS.LOCAL_STORAGE_KEY) || '{}'),
    ).toEqual({
      [CONSOLE_NAMESPACE_SYSTEM_NAMESPACE_KEY]: true,
    });
  });

  it('coalesces rapid writes to the latest value', async () => {
    const { result } = renderHook(() =>
      useConsoleUserSettingLocalStorage(
        CONSOLE_NAMESPACE_SYSTEM_NAMESPACE_KEY,
        parseStoredBooleanUserPreference,
        false,
      ),
    );

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    await act(async () => {
      const firstWrite = result.current[1](true);
      const secondWrite = result.current[1](false);
      await Promise.all([firstWrite, secondWrite]);
    });

    expect(result.current[0]).toBe(false);
    expect(
      JSON.parse(localStorage.getItem(CONSOLE_USER_SETTINGS.LOCAL_STORAGE_KEY) || '{}'),
    ).toEqual({
      [CONSOLE_NAMESPACE_SYSTEM_NAMESPACE_KEY]: false,
    });
  });

  it('rolls back to persisted value when a write fails', async () => {
    const { result } = renderHook(() =>
      useConsoleUserSettingLocalStorage(
        CONSOLE_NAMESPACE_SYSTEM_NAMESPACE_KEY,
        parseStoredBooleanUserPreference,
        false,
      ),
    );

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    await act(async () => {
      await result.current[1](true);
    });

    expect(result.current[0]).toBe(true);

    jest.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('QuotaExceededError');
    });

    await act(async () => {
      await expect(result.current[1](false)).rejects.toThrow('QuotaExceededError');
    });

    expect(result.current[0]).toBe(true);

    jest.restoreAllMocks();

    expect(
      JSON.parse(localStorage.getItem(CONSOLE_USER_SETTINGS.LOCAL_STORAGE_KEY) || '{}'),
    ).toEqual({
      [CONSOLE_NAMESPACE_SYSTEM_NAMESPACE_KEY]: true,
    });
  });

  it('updates when another tab writes to localStorage', async () => {
    const { result } = renderHook(() =>
      useConsoleUserSettingLocalStorage(
        CONSOLE_NAMESPACE_SYSTEM_NAMESPACE_KEY,
        parseStoredBooleanUserPreference,
        false,
      ),
    );

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    const newValue = JSON.stringify({
      [CONSOLE_NAMESPACE_SYSTEM_NAMESPACE_KEY]: true,
    });

    act(() => {
      localStorage.setItem(CONSOLE_USER_SETTINGS.LOCAL_STORAGE_KEY, newValue);
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: CONSOLE_USER_SETTINGS.LOCAL_STORAGE_KEY,
          newValue,
          storageArea: localStorage,
        }),
      );
    });

    await waitFor(() => {
      expect(result.current[0]).toBe(true);
    });
  });
});
