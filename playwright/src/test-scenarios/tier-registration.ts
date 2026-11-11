import { GATING_TAG, NON_PRIV_TAG, T1_TAG, T2_TAG } from '@/data-models/allure-constants';

/** Gating kubeadmin + Tier1/Tier2 non-priv projects (same test body, distinct grep tags). */
export function registerForGatingAndNonPrivTiers(register: (tagsInTitle: string) => void): void {
  register(GATING_TAG);
  register(`${T1_TAG} ${NON_PRIV_TAG}`);
  register(`${T2_TAG} ${NON_PRIV_TAG}`);
}

/** Tier1 and Tier2 non-priv Playwright projects (mutually exclusive `@tier1` / `@tier2` grep). */
export function registerForTier1AndTier2NonPriv(
  register: (tierTag: typeof T1_TAG | typeof T2_TAG) => void,
): void {
  register(T1_TAG);
  register(T2_TAG);
}
