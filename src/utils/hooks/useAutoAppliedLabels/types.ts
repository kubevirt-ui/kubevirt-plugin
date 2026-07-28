export type AutoAppliedLabel = {
  key: string;
  required: boolean;
  value: string;
};

export type UseAutoAppliedLabelsResult = {
  error: Error | null;
  isAdmin: boolean;
  labels: AutoAppliedLabel[];
  loaded: boolean;
  updateLabels: (labels: AutoAppliedLabel[]) => Promise<void>;
};
