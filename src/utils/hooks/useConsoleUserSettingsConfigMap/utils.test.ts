import {
  KUBE_ADMIN_USERNAME,
  KUBEADMIN_SETTINGS_ID,
  TEST_USERNAME,
  TEST_USERNAME_HASH,
} from '@kubevirt-utils/hooks/consoleUserSettings/tests/constants';

import { hashUsernameForSettings } from './utils';

describe('hashUsernameForSettings', () => {
  it('returns null for empty username', () => {
    expect(hashUsernameForSettings('')).toBeNull();
  });

  it('returns kubeadmin for kube:admin without uid', () => {
    expect(hashUsernameForSettings(KUBE_ADMIN_USERNAME)).toBe(KUBEADMIN_SETTINGS_ID);
  });

  it('returns SHA256 hash of username for regular users', () => {
    expect(hashUsernameForSettings(TEST_USERNAME)).toBe(TEST_USERNAME_HASH);
  });
});
