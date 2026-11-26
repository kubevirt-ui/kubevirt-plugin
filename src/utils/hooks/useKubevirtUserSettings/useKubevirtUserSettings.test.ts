import { useState } from 'react';

import { CONSOLE_USER_SETTINGS } from '@kubevirt-utils/hooks/consoleUserSettings/useConsoleUserSettingLocalStorage/consts';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import { k8sGet, useUserPreference } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';
import { act, renderHook, waitFor } from '@testing-library/react';

import useKubevirtUserSettings, { getUserPreferenceKey } from './useKubevirtUserSettings';
import {
  resetLegacyKubevirtUserSettingsMigration,
  startLegacyKubevirtUserSettingsMigration,
} from './utils/migrateLegacyKubevirtUserSettings';

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

jest.mock('@stolostron/multicluster-sdk', () => ({
  useHubClusterName: jest.fn(),
}));

jest.mock('js-sha256', () => ({
  sha256: (value: string) => `hash-${value}`,
}));

const mockedUseUserPreference = useUserPreference as jest.Mock;
const mockedK8sGet = k8sGet as jest.Mock;
const mockedUseHubClusterName = useHubClusterName as jest.Mock;
const HUB = 'local-cluster';
const NO_FLEET_ERROR = new Error(
  'A version of RHACM that is compatible with the multicluster SDK is not available',
);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sdk = require('@openshift-console/dynamic-plugin-sdk');

const USER = { metadata: { name: 'alice', uid: 'uid-alice' } };

// In-memory fake of the console user preferences store
let store: Record<string, unknown>;
let preferenceLoaded: boolean;
const setterSpy = jest.fn();

const legacyConfigMap = (data: Record<string, string>) => ({ data });
const USER_SETTINGS_CONFIG_MAP = 'user-settings-hash-alice';

const mockK8sGet = (configMap: unknown | Error) => {
  mockedK8sGet.mockImplementation(({ model }: { model: { kind: string } }) => {
    if (model.kind === 'User') return Promise.resolve(USER);
    if (configMap instanceof Error) return Promise.reject(configMap);
    return Promise.resolve(configMap);
  });
};

const mockLegacyMigrationGets = ({
  legacyData,
  legacyError,
  userSettingsData = {},
}: {
  legacyData?: Record<string, string>;
  legacyError?: Error;
  userSettingsData?: Record<string, string>;
}) => {
  mockedK8sGet.mockImplementation(
    ({ model, name, ns }: { model: { kind: string }; name?: string; ns?: string }) => {
      if (model.kind === 'User') return Promise.resolve(USER);
      if (name === 'kubevirt-user-settings') {
        if (legacyError) return Promise.reject(legacyError);
        return Promise.resolve(legacyConfigMap(legacyData ?? {}));
      }
      if (name === USER_SETTINGS_CONFIG_MAP && ns === 'openshift-console-user-settings') {
        if (Object.keys(userSettingsData).length === 0)
          return Promise.reject(new Error('not found'));
        return Promise.resolve({ data: userSettingsData });
      }
      return Promise.reject(new Error('not found'));
    },
  );
};

const expectNoWrites = () => {
  expect(sdk.k8sPatch).not.toHaveBeenCalled();
  expect(sdk.k8sCreate).not.toHaveBeenCalled();
  expect(sdk.k8sUpdate).not.toHaveBeenCalled();
  expect(sdk.k8sDelete).not.toHaveBeenCalled();
};

beforeEach(() => {
  jest.clearAllMocks();
  resetLegacyKubevirtUserSettingsMigration();
  operatorNamespaceSignal.value = 'openshift-cnv';
  window.SERVER_FLAGS = {
    authDisabled: false,
    branding: 'okd',
    userSettingsLocation: CONSOLE_USER_SETTINGS.LOCATION.CONFIGMAP,
  };
  localStorage.clear();
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
  mockedUseHubClusterName.mockReturnValue([HUB, true, undefined]);
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
    expect(getUserPreferenceKey('columns', 'spoke-1', HUB)).toBe('kubevirt.columns');
  });

  it('resolves the hub cluster (Fleet Virtualization) to the local cluster key', () => {
    expect(getUserPreferenceKey('ssh', HUB, HUB)).toBe('kubevirt.ssh');
    expect(getUserPreferenceKey('ssh', 'my-renamed-hub', 'my-renamed-hub')).toBe('kubevirt.ssh');
  });

  it('uses kubevirt.ssh for the local cluster (Virtualization) with or without ACM', () => {
    expect(getUserPreferenceKey('ssh', undefined, HUB)).toBe('kubevirt.ssh');
    expect(getUserPreferenceKey('ssh', '', HUB)).toBe('kubevirt.ssh');
    expect(getUserPreferenceKey('ssh', undefined, undefined)).toBe('kubevirt.ssh');
    expect(getUserPreferenceKey('ssh', '', undefined)).toBe('kubevirt.ssh');
  });

  it('keeps a per-cluster key for managed spoke clusters', () => {
    expect(getUserPreferenceKey('ssh', 'spoke-1', HUB)).toBe('kubevirt.ssh.spoke-1');
  });
});

describe('useKubevirtUserSettings ssh key resolution across local, hub and spoke clusters', () => {
  it('reads and writes the same kubevirt.ssh key for the local cluster and the hub cluster', async () => {
    const { result } = renderHook(() => ({
      hub: useKubevirtUserSettings('ssh', HUB),
      local: useKubevirtUserSettings('ssh'),
      wizardLocal: useKubevirtUserSettings('ssh', ''),
    }));
    await waitFor(() => expect(result.current.hub[2]).toBe(true));

    expect(mockedUseUserPreference).toHaveBeenCalledWith('kubevirt.ssh', undefined, true);
    expect(mockedUseUserPreference).not.toHaveBeenCalledWith(
      `kubevirt.ssh.${HUB}`,
      undefined,
      true,
    );

    act(() => {
      result.current.hub[1]({ ns1: 'hub-secret' });
    });

    expect(store['kubevirt.ssh']).toEqual({ ns1: 'hub-secret' });
    expect(store[`kubevirt.ssh.${HUB}`]).toBeUndefined();

    act(() => {
      result.current.local[1]({ ns1: 'local-secret' });
    });

    expect(store['kubevirt.ssh']).toEqual({ ns1: 'local-secret' });
  });

  it('returns a value stored from Virtualization when read from Fleet Virtualization on the hub', async () => {
    store['kubevirt.ssh'] = { ns1: 'secret1' };
    const { result } = renderHook(() => useKubevirtUserSettings('ssh', HUB));
    await waitFor(() => expect(result.current[2]).toBe(true));

    expect(result.current[0]).toEqual({ ns1: 'secret1' });
  });

  it('keeps spoke cluster ssh keys isolated from the hub / local key', async () => {
    store['kubevirt.ssh'] = { ns1: 'hub-secret' };
    const { result } = renderHook(() => useKubevirtUserSettings('ssh', 'spoke-1'));
    await waitFor(() => expect(result.current[2]).toBe(true));

    expect(result.current[0]).toBeUndefined();

    act(() => {
      result.current[1]({ ns1: 'spoke-secret' });
    });

    expect(store['kubevirt.ssh.spoke-1']).toEqual({ ns1: 'spoke-secret' });
    expect(store['kubevirt.ssh']).toEqual({ ns1: 'hub-secret' });
  });

  it('honours a renamed hub cluster', async () => {
    mockedUseHubClusterName.mockReturnValue(['my-renamed-hub', true, undefined]);
    store['kubevirt.ssh'] = { ns1: 'secret1' };

    const { result } = renderHook(() => useKubevirtUserSettings('ssh', 'my-renamed-hub'));
    await waitFor(() => expect(result.current[2]).toBe(true));

    expect(result.current[0]).toEqual({ ns1: 'secret1' });
  });

  it('is not loaded and hides the value while the hub cluster name is resolving', async () => {
    mockedUseHubClusterName.mockReturnValue([undefined, false, undefined]);
    store[`kubevirt.ssh.${HUB}`] = { ns1: 'stale' };

    const { result } = renderHook(() => useKubevirtUserSettings('ssh', HUB));
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current[0]).toBeUndefined();
    expect(result.current[2]).toBe(false);
  });

  it('does not wait for the hub cluster name when no cluster is passed', async () => {
    mockedUseHubClusterName.mockReturnValue([undefined, false, undefined]);
    store['kubevirt.ssh'] = { ns1: 'secret1' };

    const { result } = renderHook(() => useKubevirtUserSettings('ssh'));
    await waitFor(() => expect(result.current[2]).toBe(true));

    expect(result.current[0]).toEqual({ ns1: 'secret1' });
  });

  it('uses kubevirt.ssh on standalone (non-ACM) clusters', async () => {
    mockedUseHubClusterName.mockReturnValue([undefined, false, NO_FLEET_ERROR]);
    store['kubevirt.ssh'] = { ns1: 'secret1' };

    const { result } = renderHook(() => ({
      empty: useKubevirtUserSettings('ssh', ''),
      none: useKubevirtUserSettings('ssh'),
    }));
    await waitFor(() => expect(result.current.none[2]).toBe(true));

    expect(result.current.none[0]).toEqual({ ns1: 'secret1' });
    expect(result.current.empty[0]).toEqual({ ns1: 'secret1' });
    expect(result.current.empty[2]).toBe(true);
  });

  it('does not wait for the hub cluster name for non ssh settings', async () => {
    mockedUseHubClusterName.mockReturnValue([undefined, false, undefined]);
    store['kubevirt.columns'] = { vms: ['name'] };

    const { result } = renderHook(() => useKubevirtUserSettings('columns', 'spoke-1'));
    await waitFor(() => expect(result.current[2]).toBe(true));

    expect(result.current[0]).toEqual({ vms: ['name'] });
  });
});

describe('useKubevirtUserSettings (hub)', () => {
  beforeEach(() => {
    startLegacyKubevirtUserSettingsMigration('openshift-cnv');
  });

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

  it('writes updates via setPreference from useUserPreference', async () => {
    const { result } = renderHook(() => useKubevirtUserSettings('ssh'));
    await waitFor(() => expect(result.current[2]).toBe(true));

    act(() => {
      result.current[1]({ default: 'ssh-rsa AAA' });
    });

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
});

describe('legacy kubevirt-user-settings migration', () => {
  beforeEach(() => {
    resetLegacyKubevirtUserSettingsMigration();
  });

  it('writes all legacy keys in one ConfigMap create', async () => {
    mockLegacyMigrationGets({
      legacyData: {
        'uid-alice': JSON.stringify({
          columns: { vms: ['name', 'status'] },
          ssh: { ns1: 'secret1' },
        }),
      },
    });
    startLegacyKubevirtUserSettingsMigration('openshift-cnv');

    const { result } = renderHook(() => ({
      columns: useKubevirtUserSettings('columns'),
      ssh: useKubevirtUserSettings('ssh'),
    }));

    await waitFor(() => expect(result.current.ssh[2]).toBe(true));

    expect(sdk.k8sCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          data: expect.objectContaining({
            'kubevirt.columns': JSON.stringify({ vms: ['name', 'status'] }),
            'kubevirt.ssh': JSON.stringify({ ns1: 'secret1' }),
          }),
        }),
      }),
    );
    expect(setterSpy).not.toHaveBeenCalled();
  });

  it('does not overwrite existing keys and still copies missing legacy keys', async () => {
    store['kubevirt.columns'] = { new: ['value'] };
    mockLegacyMigrationGets({
      legacyData: {
        'uid-alice': JSON.stringify({
          columns: { old: ['value'] },
          onboardingPopoversHidden: { catalog: true },
        }),
      },
      userSettingsData: { 'kubevirt.columns': JSON.stringify({ new: ['value'] }) },
    });
    startLegacyKubevirtUserSettingsMigration('openshift-cnv');
    await waitFor(() => expect(sdk.k8sPatch).toHaveBeenCalled());

    expect(sdk.k8sCreate).not.toHaveBeenCalled();
    expect(sdk.k8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          {
            op: 'replace',
            path: '/data',
            value: expect.objectContaining({
              'kubevirt.columns': JSON.stringify({ new: ['value'] }),
              'kubevirt.onboardingPopoversHidden': JSON.stringify({ catalog: true }),
            }),
          },
        ],
      }),
    );

    const { result } = renderHook(() => useKubevirtUserSettings('columns'));
    await waitFor(() => expect(result.current[2]).toBe(true));
    expect(result.current[0]).toEqual({ new: ['value'] });
  });

  it('writes all legacy keys in one localStorage update', async () => {
    window.SERVER_FLAGS.userSettingsLocation = CONSOLE_USER_SETTINGS.LOCATION.LOCALSTORAGE;
    mockLegacyMigrationGets({
      legacyData: {
        'uid-alice': JSON.stringify({ navigation: { autoHideNav: true } }),
      },
    });
    startLegacyKubevirtUserSettingsMigration('openshift-cnv');

    const { result } = renderHook(() => useKubevirtUserSettings('navigation'));
    await waitFor(() => expect(result.current[2]).toBe(true));

    expect(
      JSON.parse(localStorage.getItem(CONSOLE_USER_SETTINGS.LOCAL_STORAGE_KEY) ?? '{}'),
    ).toEqual({
      'kubevirt.navigation': { autoHideNav: true },
    });
    expect(mockedK8sGet).toHaveBeenCalledTimes(2);
    expect(sdk.k8sCreate).not.toHaveBeenCalled();
  });
});

describe('useKubevirtUserSettings without legacy migration', () => {
  it('does not run legacy migration for ACM spoke ssh keys', async () => {
    operatorNamespaceSignal.value = 'openshift-cnv';
    mockLegacyMigrationGets({
      legacyData: { 'uid-alice': JSON.stringify({ ssh: { ns1: 'secret1' } }) },
    });

    const { result } = renderHook(() => useKubevirtUserSettings('ssh', 'spoke-1'));
    await waitFor(() => expect(result.current[2]).toBe(true));

    expect(result.current[0]).toBeUndefined();
    expect(mockedK8sGet).not.toHaveBeenCalled();
  });
});
