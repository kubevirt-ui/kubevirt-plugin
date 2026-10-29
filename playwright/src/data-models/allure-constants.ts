/**
 * Allure reporting metadata constants (kubevirt-ui main).
 * Use with `withAllure({ feature, tags })` and Playwright project `grep` on tier tags.
 */

/** Allure feature label for Tier 1 tests. */
export const T1 = 'Tier 1';

/** Allure feature label for Tier 2 tests. */
export const T2 = 'Tier 2';

/** Allure feature label for Gating tests. */
export const GATING = 'Gating';

/** Tier tags — Playwright projects filter on these (same as main). */
export const GATING_TAG = '@gating';
export const T1_TAG = '@tier1';
export const T2_TAG = '@tier2';

/** Kubeadmin-only specs (excluded from Tier1NonPriv / Tier2NonPriv via `grepInvert`). */
export const ADMIN_ONLY_TAG = '@admin-only';

/** Runs in non-priv tier lanes; usually paired with `@tier1` / `@tier2` (incl. UI create flows). */
export const NON_PRIV_TAG = '@non-priv';
