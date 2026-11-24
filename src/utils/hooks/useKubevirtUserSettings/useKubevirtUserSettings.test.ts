import { useState } from 'react';

import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import { k8sGet, useUserPreference } from '@openshift-console/dynamic-plugin-sdk';
import { act, renderHook, waitFor } from '@testing-library/react';

import useKubevirtUserSettings, { getUserPreferenceKey } from './useKubevirtUserSettings';
import { resetLegacyUserSettingsCache } from './utils/legacyUserSettings';

jest.mock('@kubevirt-utils/store/operatorNamespace', () => ({
  operatorNamespaceSignal: { value: 'openshift-cnv' },
}));

jest.mock('@preact/signals-react/runtime', () => ({ useSignals: jest.fn() }));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn(),
  k8sDelete: jest.fn(),
  k8sGet: jest.fn(),
  k8sPatch: jest.fn(),
  k8sUpdate: jest.fn(),
  useUserPreference: jest.fn(),
}));

const mockedUseUserPreference = useUserPreference as jest.Mock;
const mockedK8sGet = k8sGet as jest.Mock;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sdk = require('@openshift-console/dynamic-plugin-sdk');

const USER = { metadata: { name: 'alice', uid: 'uid-alice' } };

// In-memory fake of the console user preferences store
let store: Record<string, unknown>;
let preferenceLoaded: boolean;
const setterSpy = jest.fn();

const legacyConfigMap = (data: Record<string, string>) => ({ data });

const mockK8sGet = (configMap: unknown | Error) => {
  mockedK8sGet.mockImplementation(({ model }: { model: { kind: string } }) => {
    if (model.kind === 'User') return Promise.resolve(USER);
    if (configMap instanceof Error) return Promise.reject(configMap);
    return Promise.resolve(configMap);
  });
};

const expectNoWrites = () => {
  expect(sdk.k8sPatch).not.toHaveBeenCalled();
  expect(sdk.k8sCreate).not.toHaveBeenCalled();
  expect(sdk.k8sUpdate).not.toHaveBeenCalled();
  expect(sdk.k8sDelete).not.toHaveBeenCalled();
};

beforeEach(() => {
  jest.clearAllMocks();
  resetLegacyUserSettingsCache();
  operatorNamespaceSignal.value = 'openshift-cnv';
  store = {};
  preferenceLoaded = true;

  mockedUseUserPreference.mockImplementation((key: string) => {
    const [tick, setTick] = useState(0);
    void tick;
    const setter = (val: unknown) => {
      setterSpy(key, val);
      store[key] = val;
      setTick((n) => n + 1);
    };
    return [store[key], setter, preferenceLoaded];
  });

  mockK8sGet(new Error('not found'));
});

describe('getUserPreferenceKey', () => {
  it('prefixes every setting with kubevirt.', () => {
    expect(getUserPreferenceKey('columns')).toBe('kubevirt.columns');
    expect(getUserPreferenceKey('columnWidths')).toBe('kubevirt.columnWidths');
    expect(getUserPreferenceKey('quickStart')).toBe('kubevirt.quickStart');
    expect(getUserPreferenceKey('defaultVMLabels')).toBe('kubevirt.defaultVMLabels');
    expect(getUserPreferenceKey('navigation')).toBe('kubevirt.navigation');
    expect(getUserPreferenceKey('recentSearches')).toBe('kubevirt.recentSearches');
    expect(getUserPreferenceKey('savedSearches')).toBe('kubevirt.savedSearches');
    expect(getUserPreferenceKey('onboardingPopoversHidden')).toBe(
      'kubevirt.onboardingPopoversHidden',
    );
    expect(getUserPreferenceKey('ssh')).toBe('kubevirt.ssh');
  });

  it('stores ssh keys of ACM spoke clusters as kubevirt.ssh.<cluster>', () => {
    expect(getUserPreferenceKey('ssh', 'spoke-1')).toBe('kubevirt.ssh.spoke-1');
  });

  it('does not suffix non cluster scoped settings with the cluster', () => {
    expect(getUserPreferenceKey('columns', 'spoke-1')).toBe('kubevirt.columns');
  });
});

describe('useKubevirtUserSettings', () => {
  it('calls useUserPreference with sync=true and an undefined default value', async () => {
    const { result } = renderHook(() => useKubevirtUserSettings('columns'));

    await waitFor(() => expect(result.current[2]).toBe(true));

    expect(mockedUseUserPreference).toHaveBeenCalledWith('kubevirt.columns', undefined, true);
  });

  it('uses the spoke key for ssh on ACM spoke clusters', async () => {
    const { result } = renderHook(() => useKubevirtUserSettings('ssh', 'spoke-1'));

    await waitFor(() => expect(result.current[2]).toBe(true));

    expect(mockedUseUserPreference).toHaveBeenCalledWith('kubevirt.ssh.spoke-1', undefined, true);
  });

  it('returns the stored preference', async () => {
    store['kubevirt.columns'] = { vms: ['name'] };
    const { result } = renderHook(() => useKubevirtUserSettings('columns'));

    await waitFor(() => expect(result.current[2]).toBe(true));

    expect(result.current[0]).toEqual({ vms: ['name'] });
  });

  it('writes updates to the user preference and resolves with the value', async () => {
    const { result } = renderHook(() => useKubevirtUserSettings('ssh'));
    await waitFor(() => expect(result.current[2]).toBe(true));

    let resolved: unknown;
    await act(async () => {
      resolved = await result.current[1]({ default: 'ssh-rsa AAA' });
    });

    expect(resolved).toEqual({ default: 'ssh-rsa AAA' });
    expect(store['kubevirt.ssh']).toEqual({ default: 'ssh-rsa AAA' });
    expect(result.current[0]).toEqual({ default: 'ssh-rsa AAA' });
    expectNoWrites();
  });

  it('is not loaded until the user preference is loaded', async () => {
    preferenceLoaded = false;
    const { result } = renderHook(() => useKubevirtUserSettings('columns'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current[2]).toBe(false);
  });

  it('is not loaded until the operator namespace is known', async () => {
    operatorNamespaceSignal.value = null;
    const { result } = renderHook(() => useKubevirtUserSettings('columns'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current[2]).toBe(false);
    expect(mockedK8sGet).not.toHaveBeenCalled();
  });

  describe('legacy kubevirt-user-settings migration', () => {
    it('migrates missing keys from the legacy ConfigMap into the user preference', async () => {
      mockK8sGet(
        legacyConfigMap({
          'uid-alice': JSON.stringify({
            columns: { vms: ['name', 'status'] },
            ssh: { ns1: 'secret1' },
          }),
        }),
      );

      const { result } = renderHook(() => useKubevirtUserSettings('ssh'));
      await waitFor(() => expect(result.current[2]).toBe(true));

      expect(result.current[0]).toEqual({ ns1: 'secret1' });
      await waitFor(() => expect(store['kubevirt.ssh']).toEqual({ ns1: 'secret1' }));
      expectNoWrites();
    });

    it('reads the legacy ConfigMap only once for many hook instances and never writes', async () => {
      mockK8sGet(legacyConfigMap({ 'uid-alice': JSON.stringify({ columns: { a: ['b'] } }) }));

      const { result } = renderHook(() => ({
        columns: useKubevirtUserSettings('columns'),
        navigation: useKubevirtUserSettings('navigation'),
        ssh: useKubevirtUserSettings('ssh'),
      }));
      await waitFor(() => expect(result.current.ssh[2]).toBe(true));
      await waitFor(() => expect(result.current.columns[2]).toBe(true));

      // one GET for the user + one GET for the ConfigMap
      expect(mockedK8sGet).toHaveBeenCalledTimes(2);
      expectNoWrites();
    });

    it('does not migrate the same key twice', async () => {
      mockK8sGet(legacyConfigMap({ 'uid-alice': JSON.stringify({ columns: { a: ['b'] } }) }));

      const { result } = renderHook(() => ({
        first: useKubevirtUserSettings('columns'),
        second: useKubevirtUserSettings('columns'),
      }));
      await waitFor(() => expect(result.current.first[2]).toBe(true));
      await waitFor(() => expect(store['kubevirt.columns']).toBeDefined());

      expect(setterSpy.mock.calls.filter(([key]) => key === 'kubevirt.columns')).toHaveLength(1);
    });

    it('never overwrites an existing user preference', async () => {
      store['kubevirt.columns'] = { new: ['value'] };
      mockK8sGet(legacyConfigMap({ 'uid-alice': JSON.stringify({ columns: { old: ['value'] } }) }));

      const { result } = renderHook(() => useKubevirtUserSettings('columns'));
      await waitFor(() => expect(result.current[2]).toBe(true));

      expect(result.current[0]).toEqual({ new: ['value'] });
      expect(setterSpy).not.toHaveBeenCalled();
    });

    it('does not migrate before the user preference is loaded', async () => {
      preferenceLoaded = false;
      mockK8sGet(legacyConfigMap({ 'uid-alice': JSON.stringify({ columns: { old: ['v'] } }) }));

      renderHook(() => useKubevirtUserSettings('columns'));
      await waitFor(() => expect(mockedK8sGet).toHaveBeenCalledTimes(2));
      await act(async () => {
        await Promise.resolve();
      });

      expect(setterSpy).not.toHaveBeenCalled();
    });

    it('does not migrate ACM spoke ssh keys and does not read the legacy ConfigMap', async () => {
      mockK8sGet(legacyConfigMap({ 'uid-alice': JSON.stringify({ ssh: { ns1: 'secret1' } }) }));

      const { result } = renderHook(() => useKubevirtUserSettings('ssh', 'spoke-1'));
      await waitFor(() => expect(result.current[2]).toBe(true));

      expect(result.current[0]).toBeUndefined();
      expect(setterSpy).not.toHaveBeenCalled();
      expect(mockedK8sGet).not.toHaveBeenCalled();
    });

    it.each([
      ['403 forbidden', new Error('Forbidden')],
      ['404 not found', new Error('Not found')],
    ])('handles %s gracefully', async (_name, error) => {
      mockK8sGet(error);

      const { result } = renderHook(() => useKubevirtUserSettings('columns'));
      await waitFor(() => expect(result.current[2]).toBe(true));

      expect(result.current[0]).toBeUndefined();
      expect(setterSpy).not.toHaveBeenCalled();
      expectNoWrites();
    });

    it('handles a user lookup failure gracefully', async () => {
      mockedK8sGet.mockRejectedValue(new Error('boom'));

      const { result } = renderHook(() => useKubevirtUserSettings('columns'));
      await waitFor(() => expect(result.current[2]).toBe(true));

      expect(result.current[0]).toBeUndefined();
    });

    it.each([
      ['no data', {}],
      ['no entry for the user', { data: { 'uid-bob': '{"columns":{}}' } }],
      ['malformed JSON', { data: { 'uid-alice': '{not json' } }],
      ['a non-object entry', { data: { 'uid-alice': '"just a string"' } }],
      ['an array entry', { data: { 'uid-alice': '[1,2]' } }],
    ])('ignores a legacy ConfigMap with %s', async (_name, configMap) => {
      mockK8sGet(configMap);

      const { result } = renderHook(() => useKubevirtUserSettings('columns'));
      await waitFor(() => expect(result.current[2]).toBe(true));

      expect(result.current[0]).toBeUndefined();
      expect(setterSpy).not.toHaveBeenCalled();
    });

    it('does not migrate keys absent from the legacy entry', async () => {
      mockK8sGet(legacyConfigMap({ 'uid-alice': JSON.stringify({ columns: { a: ['b'] } }) }));

      const { result } = renderHook(() => useKubevirtUserSettings('navigation'));
      await waitFor(() => expect(result.current[2]).toBe(true));

      expect(result.current[0]).toBeUndefined();
      expect(setterSpy).not.toHaveBeenCalled();
    });

    it('falls back to the user name when the user has no uid', async () => {
      mockedK8sGet.mockImplementation(({ model }: { model: { kind: string } }) =>
        model.kind === 'User'
          ? Promise.resolve({ metadata: { name: 'system:admin' } })
          : Promise.resolve(
              legacyConfigMap({
                'system-admin': JSON.stringify({ navigation: { autoHideNav: true } }),
              }),
            ),
      );

      const { result } = renderHook(() => useKubevirtUserSettings('navigation'));
      await waitFor(() => expect(result.current[2]).toBe(true));

      expect(result.current[0]).toEqual({ autoHideNav: true });
    });
  });
});
