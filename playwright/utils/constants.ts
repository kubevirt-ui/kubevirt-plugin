export const SECOND = 1_000;
export const MINUTE = 60_000;

// ── Named timeout constants ───────────────────────────────────────────────────

/** Short UI interaction timeout (input visibility, section expand). */
export const SHORT_TIMEOUT = 10 * SECOND;

/** Standard navigation/render timeout (page load, React hydration). */
export const NAV_TIMEOUT = 30 * SECOND;

// ── Selector IDs shared across multiple pages / tests ────────────────────────
// Page-specific IDs live at the top of their respective page files.

export const CONFIRM_ACTION = 'confirm-action';
export const CONFIRM_VM_ACTIONS = 'confirm-vm-actions';
export const ITEM_CREATE = 'item-create';
export const KEBAB_BUTTON = 'kebab-button';
export const SAVE_CHANGES = 'save-changes';
