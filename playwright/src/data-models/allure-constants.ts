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

/** Playwright tag for auto-applied labels specs. */
export const AUTO_LABELS_TAG = '@auto-labels';

/** Allure feature label for auto-applied labels. */
export const AUTO_LABELS_FEATURE = 'Auto-Applied Labels';

/** Tag for networking tests. */
export const NETWORKING_TAG_LABEL = 'networking';

/** Playwright/Allure tag for CNV global settings tests (cluster/user/preview). */
export const CNV_SETTINGS_TAG = '@cnv-settings';

/** Allure feature label for CNV global settings tests. */
export const CNV_SETTINGS_FEATURE = 'CNV Settings';

/** Allure feature label for VM migration tests (compute + storage). */
export const MIGRATION_FEATURE = 'Migrations';

/** Playwright/Allure tag for VM migration tests. */
export const MIGRATION_TAG = '@migration';

/** Allure feature label for s390x architecture-specific tests. */
export const S390X_FEATURE = 's390x';

/** Playwright/Allure tag for s390x architecture-specific tests. */
export const S390X_TAG = '@s390x';
