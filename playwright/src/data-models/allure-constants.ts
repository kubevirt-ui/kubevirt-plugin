/**
 * Allure reporting metadata constants.
 *
 * Import from this file in all spec files for withAllure({ suite, feature, tags })
 * and for test.describe({ tag: [...] }) tier/feature-area tags.
 *
 * Never use raw string literals for these values — always reference a constant.
 */

// ── Feature (Allure "feature" field) ─────────────────────────────────────────

/** Allure feature label for Tier 1 tests. */
export const T1 = 'Tier 1';

/** Allure feature label for Tier 2 tests. */
export const T2 = 'Tier 2';

/** Allure feature label for Gating tests. */
export const GATING = 'Gating';

/** Allure feature label for ACM fleet-virtualization tests. */
export const ACM_FEATURE = 'acm-fleet-virtualization';

// ── Tier tags (Playwright tag / Allure "tags" array) ─────────────────────────

/** Playwright/Allure tag for Tier 1 tests. */
export const T1_TAG = '@tier1';

/** Playwright/Allure tag for Tier 2 tests. */
export const T2_TAG = '@tier2';

/** Playwright/Allure tag for Gating tests. */
export const GATING_TAG = '@gating';

/** Playwright/Allure tag for ACM fleet-virtualization tests. */
export const ACM_TAG = '@fleet-virtualization-acm';

// ── Feature-area tags (used in multiple spec files) ───────────────────────────

/** Tag for tests requiring cluster-admin privileges. */
export const ADMIN_ONLY_TAG = '@adminOnly';

/** Tag for VM detail tab tests. */
export const VM_TABS_TAG = 'vm-tabs';

/** Tag for VM action (lifecycle, migration, resource) tests. */
export const VM_ACTIONS_TAG = 'vm-actions';

/** Tag for VM list page tests. */
export const VM_LIST_TAG = 'vm-list';

/** Tag for VM overview tab tests. */
export const VM_OVERVIEW_TAG = 'vm-overview';

/** Tag for networking tests. */
export const NETWORKING_TAG_LABEL = 'networking';

/** Playwright/Allure tag for CNV global settings tests (cluster settings, user settings, preview features). */
export const CNV_SETTINGS_TAG = '@cnv-settings';

/** Allure feature label for CNV global settings tests. */
export const CNV_SETTINGS_FEATURE = 'CNV Settings';

/** Allure feature label for s390x architecture-specific tests. */
export const S390X_FEATURE = 's390x';

/** Playwright/Allure tag for s390x architecture-specific tests. */
export const S390X_TAG = '@s390x';

/** Allure feature label for non-privileged user tests. */
export const NONPRIV_FEATURE = 'Non-Priv';

/** Playwright/Allure tag for non-privileged user tests. */
export const NONPRIV_TAG = '@nonpriv';

/** Allure feature label for VM migration tests (compute + storage). */
export const MIGRATION_FEATURE = 'Migrations';

/** Playwright/Allure tag for VM migration tests. */
export const MIGRATION_TAG = '@migration';

/** Allure feature label for visual regression tests. */
export const VISUAL = 'Visual';

/** Playwright/Allure tag for visual regression tests. */
export const VISUAL_TAG = '@visual';
