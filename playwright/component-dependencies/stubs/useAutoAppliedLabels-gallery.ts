import type { UseAutoAppliedLabelsResult } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';

const useAutoAppliedLabels = (): UseAutoAppliedLabelsResult => ({
  labels: [],
  loaded: true,
  loadError: null,
  updateError: null,
  updateLabels: async () => undefined,
});

export default useAutoAppliedLabels;
