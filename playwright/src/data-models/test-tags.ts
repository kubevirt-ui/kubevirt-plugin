/**
 * Test tags and feature labels for Playwright test organization.
 *
 * Used in test.describe({ tag: [...] }) for filtering and reporting.
 * Never use raw string literals — always reference a constant from here.
 */

// ── Feature labels ──────────────────────────────────────────────────────────

export const T1 = 'Tier 1';
export const T2 = 'Tier 2';
export const GATING = 'Gating';
export const CNV_SETTINGS_FEATURE = 'CNV Settings';
export const S390X_FEATURE = 's390x';
export const NONPRIV_FEATURE = 'Non-Priv';
export const MIGRATION_FEATURE = 'Migrations';
export const VISUAL = 'Visual';

// ── Tier tags ───────────────────────────────────────────────────────────────

export const T1_TAG = '@tier1';
export const T2_TAG = '@tier2';
export const GATING_TAG = '@gating';
// ── Feature-area tags ───────────────────────────────────────────────────────

export const ADMIN_ONLY_TAG = '@adminOnly';
export const VM_TABS_TAG = 'vm-tabs';
export const VM_ACTIONS_TAG = 'vm-actions';
export const VM_LIST_TAG = 'vm-list';
export const VM_OVERVIEW_TAG = 'vm-overview';

export const CNV_SETTINGS_TAG = '@cnv-settings';
export const S390X_TAG = '@s390x';
export const NONPRIV_TAG = '@nonpriv';
export const MIGRATION_TAG = '@migration';
export const VISUAL_TAG = '@visual';
