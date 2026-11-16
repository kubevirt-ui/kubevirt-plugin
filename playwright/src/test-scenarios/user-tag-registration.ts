import { ADMIN_ONLY_TAG, NON_PRIV_TAG } from '@/data-models/allure-constants';

/** Run the same `test.describe` block for kubeadmin and non-priv Playwright projects. */
export function registerForAdminAndNonPriv(register: (userTag: string) => void): void {
  register(ADMIN_ONLY_TAG);
  register(NON_PRIV_TAG);
}
