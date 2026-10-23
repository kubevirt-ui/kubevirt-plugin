/**
 * Gallery alias for `@kubevirt-utils/hooks/useAutoAppliedLabels/useAutoAppliedLabels`.
 * Returns no auto-labels and skips cluster ConfigMap watches in component scenes.
 */
import type { UseAutoAppliedLabelsResult } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';

/** Stub implementation wired via `gallery-resolve` for the VM wizard scene. */
const useAutoAppliedLabels = (): UseAutoAppliedLabelsResult => ({
  canEdit: true,
  error: null,
  labels: [],
  loaded: true,
  updateLabels: async () => undefined,
});

export default useAutoAppliedLabels;
