import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { CONSOLE_NAMESPACE_BOOKMARKS_KEY } from '@kubevirt-utils/hooks/useConsoleNamespaceBookmarks/consts';
import { kubevirtK8sCreate, kubevirtK8sGet, kubevirtK8sPatch } from '@multicluster/k8sRequests';

import { TEST_FAVORITE_BOOKMARKS, USER_SETTINGS_CONFIG_MAP_NAME } from './tests/constants';
import { parseBookmarks } from './useConsoleBookmarks/utils';
import { CONSOLE_USER_SETTINGS } from './useConsoleUserSettingLocalStorage/consts';
import {
  getConfigMapValue,
  isConsoleUserSettingsLocalStorage,
  upsertConsoleUserSetting,
} from './utils';

jest.mock('@multicluster/k8sRequests', () => ({
  kubevirtK8sCreate: jest.fn(),
  kubevirtK8sGet: jest.fn(),
  kubevirtK8sPatch: jest.fn(),
}));

const mockKubevirtK8sCreate = kubevirtK8sCreate as jest.Mock;
const mockKubevirtK8sGet = kubevirtK8sGet as jest.Mock;
const mockKubevirtK8sPatch = kubevirtK8sPatch as jest.Mock;

describe('getConfigMapValue', () => {
  const configMap: IoK8sApiCoreV1ConfigMap = {
    apiVersion: 'v1',
    data: {
      [CONSOLE_NAMESPACE_BOOKMARKS_KEY]: JSON.stringify(TEST_FAVORITE_BOOKMARKS),
    },
    kind: 'ConfigMap',
    metadata: { name: USER_SETTINGS_CONFIG_MAP_NAME, namespace: 'openshift-console-user-settings' },
  };

  it('returns parsed value when ConfigMap is loaded', () => {
    expect(
      getConfigMapValue(
        configMap,
        USER_SETTINGS_CONFIG_MAP_NAME,
        true,
        CONSOLE_NAMESPACE_BOOKMARKS_KEY,
        parseBookmarks,
        {},
      ),
    ).toEqual(TEST_FAVORITE_BOOKMARKS);
  });

  it('returns empty value when ConfigMap is missing after load', () => {
    expect(
      getConfigMapValue(
        undefined,
        USER_SETTINGS_CONFIG_MAP_NAME,
        true,
        CONSOLE_NAMESPACE_BOOKMARKS_KEY,
        parseBookmarks,
        {},
      ),
    ).toEqual({});
  });
});

describe('isConsoleUserSettingsLocalStorage', () => {
  beforeEach(() => {
    window.SERVER_FLAGS = {
      authDisabled: false,
      branding: 'okd',
      userSettingsLocation: CONSOLE_USER_SETTINGS.LOCATION.LOCALSTORAGE,
    };
  });

  it('detects localStorage user settings mode', () => {
    expect(isConsoleUserSettingsLocalStorage()).toBe(true);

    window.SERVER_FLAGS.userSettingsLocation = CONSOLE_USER_SETTINGS.LOCATION.CONFIGMAP;
    expect(isConsoleUserSettingsLocalStorage()).toBe(false);
  });
});

describe('upsertConsoleUserSetting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws when user information is unavailable', async () => {
    await expect(
      upsertConsoleUserSetting({
        configMapName: null,
        key: CONSOLE_NAMESPACE_BOOKMARKS_KEY,
        serializedValue: '{}',
        userConfigMap: undefined,
        userName: undefined,
      }),
    ).rejects.toThrow('User information not available');
  });

  it('creates a ConfigMap when one does not exist', async () => {
    await upsertConsoleUserSetting({
      configMapName: USER_SETTINGS_CONFIG_MAP_NAME,
      key: CONSOLE_NAMESPACE_BOOKMARKS_KEY,
      serializedValue: JSON.stringify(TEST_FAVORITE_BOOKMARKS),
      userConfigMap: undefined,
      userName: USER_SETTINGS_CONFIG_MAP_NAME,
    });

    expect(mockKubevirtK8sCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          data: {
            [CONSOLE_NAMESPACE_BOOKMARKS_KEY]: JSON.stringify(TEST_FAVORITE_BOOKMARKS),
          },
        }),
      }),
    );
  });

  it('patches the ConfigMap when create fails with AlreadyExists', async () => {
    const existingConfigMap: IoK8sApiCoreV1ConfigMap = {
      apiVersion: 'v1',
      data: {},
      kind: 'ConfigMap',
      metadata: {
        name: USER_SETTINGS_CONFIG_MAP_NAME,
        namespace: 'openshift-console-user-settings',
      },
    };

    mockKubevirtK8sCreate.mockRejectedValueOnce({ response: { status: 409 } });
    mockKubevirtK8sGet.mockResolvedValueOnce(existingConfigMap);

    await upsertConsoleUserSetting({
      configMapName: USER_SETTINGS_CONFIG_MAP_NAME,
      key: CONSOLE_NAMESPACE_BOOKMARKS_KEY,
      serializedValue: JSON.stringify(TEST_FAVORITE_BOOKMARKS),
      userConfigMap: undefined,
      userName: USER_SETTINGS_CONFIG_MAP_NAME,
    });

    expect(mockKubevirtK8sGet).toHaveBeenCalledWith(
      expect.objectContaining({
        name: USER_SETTINGS_CONFIG_MAP_NAME,
        ns: 'openshift-console-user-settings',
      }),
    );
    expect(mockKubevirtK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        resource: existingConfigMap,
      }),
    );
  });

  it('patches an existing ConfigMap', async () => {
    const userConfigMap: IoK8sApiCoreV1ConfigMap = {
      apiVersion: 'v1',
      data: {},
      kind: 'ConfigMap',
      metadata: {
        name: USER_SETTINGS_CONFIG_MAP_NAME,
        namespace: 'openshift-console-user-settings',
      },
    };

    await upsertConsoleUserSetting({
      configMapName: USER_SETTINGS_CONFIG_MAP_NAME,
      key: CONSOLE_NAMESPACE_BOOKMARKS_KEY,
      serializedValue: JSON.stringify(TEST_FAVORITE_BOOKMARKS),
      userConfigMap,
      userName: USER_SETTINGS_CONFIG_MAP_NAME,
    });

    expect(mockKubevirtK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        resource: userConfigMap,
      }),
    );
  });
});
