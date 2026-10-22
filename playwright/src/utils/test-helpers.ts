/**
 * Mark admin-only specs with `ADMIN_ONLY_TAG` in the `test.describe` title.
 * Tier1NonPriv / Tier2NonPriv use `grepInvert: /@admin-only/` — no runtime skips.
 */
export { ADMIN_ONLY_TAG, NON_PRIV_TAG } from '@/data-models/allure-constants';
export { withAllure } from '@/utils/allure';
