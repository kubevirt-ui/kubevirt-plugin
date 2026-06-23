export const STORAGE_MIGRATION_PROBE_PHASE_IDLE = 'idle' as const;

export const STORAGE_MIGRATION_PROBE_PHASE_WAITING_CSV_AFTER_MULTI_NS_404 =
  'waiting_csv_after_multi_ns_404' as const;

export type StorageMigrationProbeFallbackPhase =
  | typeof STORAGE_MIGRATION_PROBE_PHASE_IDLE
  | typeof STORAGE_MIGRATION_PROBE_PHASE_WAITING_CSV_AFTER_MULTI_NS_404;

/** Minor >= 21 → treat multi-namespace LIST 404 as empty (skip MTC / single-namespace probes). */
export const STORAGE_MIGRATION_ASSUME_MULTI_NS_API_MIN_OPERATOR_MINOR = 21;

export const csvMinorMeetsMultiNsAssumeThreshold = (csvMinor: null | number): boolean =>
  csvMinor !== null && csvMinor >= STORAGE_MIGRATION_ASSUME_MULTI_NS_API_MIN_OPERATOR_MINOR;

export const csvLoadedIndicatesMultiNsStorageMigrationApi = (
  csvLoaded: boolean,
  csvMinor: null | number,
): boolean => csvLoaded && csvMinorMeetsMultiNsAssumeThreshold(csvMinor);

export const STORAGE_MIGRATION_CSV_WAIT_AFTER_MULTI_NS_404_MS = 2500;

export const parseKubeVirtCsvMinorVersion = (version: string | undefined): null | number => {
  if (!version || typeof version !== 'string') return null;
  const match = /^v?(\d+)\.(\d+)/i.exec(version.trim());
  if (!match) return null;
  const minor = Number.parseInt(match[2], 10);
  return Number.isFinite(minor) ? minor : null;
};
