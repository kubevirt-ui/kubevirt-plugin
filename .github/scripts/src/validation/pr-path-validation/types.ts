export type LabelMeta = { color: string; description: string };

export type PathValidationLabels = {
  alert: string;
  block: string;
  reviewed: string;
  skip: string;
};

/**
 * Generic config for a "does this PR touch a sensitive path, and if so has
 * an OWNERS reviewer signed off" check. ai-config, ci-scripts, and i18n
 * validation are thin wrappers supplying one of these to the shared
 * pr-path-validation core. Merge blocking is via do-not-merge/* labels
 * (Merge Gate), not per-gate commit statuses.
 */
export type PathValidationConfig = {
  commandName: string;
  /** Plain-English name for log/error messages, e.g. "CI configuration validation". */
  displayName: string;
  exactPaths: readonly string[];
  labelMeta: { alert: LabelMeta; block: LabelMeta };
  labels: PathValidationLabels;
  pathPrefixes: readonly string[];
  relatedAutomationPaths?: readonly string[];
  relatedAutomationPrefixes?: readonly string[];
};
