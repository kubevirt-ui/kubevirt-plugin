export type AutoAppliedLabel = {
  key: string;
  required: boolean;
  value: string;
};

export type UseAutoAppliedLabelsResult = {
  canEdit: boolean;
  error: Error | null;
  labels: AutoAppliedLabel[];
  loaded: boolean;
  updateLabels: (labels: AutoAppliedLabel[]) => Promise<void>;
};
