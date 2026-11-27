import { UserModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { CONSOLE_USER_SETTINGS } from '@kubevirt-utils/hooks/consoleUserSettings/useConsoleUserSettingLocalStorage/consts';
import { k8sCreate, k8sGet, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import {
  ensureLegacyKubevirtUserSettingsMigrated,
  resetLegacyKubevirtUserSettingsMigration,
} from './migrateLegacyKubevirtUserSettings';

jest.mock('js-sha256', () => ({
  sha256: (value: string) => `hash-${value}`,
}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn(),
  k8sGet: jest.fn(),
  k8sPatch: jest.fn(),
}));

const mockedK8sGet = k8sGet as jest.Mock;
const mockedK8sCreate = k8sCreate as jest.Mock;
const mockedK8sPatch = k8sPatch as jest.Mock;

const USER = { metadata: { name: 'alice', uid: 'uid-alice' } };
const USER_SETTINGS_CONFIG_MAP = 'user-settings-hash-alice';

beforeEach(() => {
  jest.clearAllMocks();
  resetLegacyKubevirtUserSettingsMigration();
  localStorage.clear();
  window.SERVER_FLAGS = {
    authDisabled: false,
    branding: 'okd',
    userSettingsLocation: CONSOLE_USER_SETTINGS.LOCATION.CONFIGMAP,
  };
});

describe('ensureLegacyKubevirtUserSettingsMigrated', () => {
  it('copies legacy values when no kubevirt keys are present', async () => {
    mockedK8sGet.mockImplementation(
      ({ model, name, ns }: { model: { kind: string }; name?: string; ns?: string }) => {
        if (model === UserModel || model.kind === 'User') return Promise.resolve(USER);
        if (name === 'kubevirt-user-settings') {
          return Promise.resolve({
            data: { 'uid-alice': JSON.stringify({ columns: { vms: ['name'] } }) },
          });
        }
        if (name === USER_SETTINGS_CONFIG_MAP && ns === 'openshift-console-user-settings') {
          return Promise.reject(new Error('not found'));
        }
        return Promise.reject(new Error('not found'));
      },
    );

    await ensureLegacyKubevirtUserSettingsMigrated('openshift-cnv');

    expect(mockedK8sCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          data: {
            'kubevirt.columns': JSON.stringify({ vms: ['name'] }),
          },
        }),
      }),
    );
  });

  it('does not overwrite existing keys and copies only missing legacy keys', async () => {
    mockedK8sGet.mockImplementation(
      ({ model, name, ns }: { model: { kind: string }; name?: string; ns?: string }) => {
        if (model.kind === 'User') return Promise.resolve(USER);
        if (name === USER_SETTINGS_CONFIG_MAP && ns === 'openshift-console-user-settings') {
          return Promise.resolve({
            data: { 'kubevirt.columns': JSON.stringify({ vms: ['status'] }) },
          });
        }
        if (name === 'kubevirt-user-settings') {
          return Promise.resolve({
            data: {
              'uid-alice': JSON.stringify({
                columns: { vms: ['name'] },
                onboardingPopoversHidden: { navCollapse: true },
              }),
            },
          });
        }
        return Promise.reject(new Error('not found'));
      },
    );

    await ensureLegacyKubevirtUserSettingsMigrated('openshift-cnv');

    expect(mockedK8sCreate).not.toHaveBeenCalled();
    expect(mockedK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          {
            op: 'replace',
            path: '/data',
            value: {
              'kubevirt.columns': JSON.stringify({ vms: ['status'] }),
              'kubevirt.onboardingPopoversHidden': JSON.stringify({ navCollapse: true }),
            },
          },
        ],
      }),
    );
  });
});
