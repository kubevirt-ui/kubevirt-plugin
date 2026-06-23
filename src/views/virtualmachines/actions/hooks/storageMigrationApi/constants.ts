import {
  type VersionMajorMinor,
  versionMeetsMajorMinorThreshold,
} from '@kubevirt-utils/version/versionUtils';

export const STORAGE_MIGRATION_PROBE_PHASE_IDLE = 'idle' as const;

export const STORAGE_MIGRATION_PROBE_PHASE_WAITING_CSV_AFTER_MULTI_NS_404 =
  'waiting_csv_after_multi_ns_404' as const;

export type StorageMigrationProbeFallbackPhase =
  | typeof STORAGE_MIGRATION_PROBE_PHASE_IDLE
  | typeof STORAGE_MIGRATION_PROBE_PHASE_WAITING_CSV_AFTER_MULTI_NS_404;

/**
 * OpenShift Virtualization 4.21+ → treat multi-namespace LIST 404 as empty
 * (skip MTC / single-namespace probes).
 * This threshold corresponds to the CNV release where MultiNamespaceVirtualMachineStorageMigrationPlan
 * became the canonical storage migration API. The version is read from the CSV (operator version),
 * NOT the ClusterVersion (OCP platform version).
 */
export const STORAGE_MIGRATION_ASSUME_MULTI_NS_API_MIN_VERSION: VersionMajorMinor = {
  major: 4,
  minor: 21,
};

export const csvVersionMeetsMultiNsAssumeThreshold = (version: string | undefined): boolean =>
  versionMeetsMajorMinorThreshold(version, STORAGE_MIGRATION_ASSUME_MULTI_NS_API_MIN_VERSION);

export const csvLoadedIndicatesMultiNsStorageMigrationApi = (
  csvLoaded: boolean,
  csvVersion: string | undefined,
): boolean => csvLoaded && csvVersionMeetsMultiNsAssumeThreshold(csvVersion);

export const STORAGE_MIGRATION_CSV_WAIT_AFTER_MULTI_NS_404_MS = 2500;

/**
 * OpenShift Virtualization 4.23+ → storage migrations list uses the custom route
 * `/k8s/all-namespaces/storagemigrations` instead of the GVK resource URL.
 * Spokes running < 4.23 do not register this custom route, so links from
 * the hub overview to spoke consoles must fall back to the GVK resource URL.
 */
export const STORAGE_MIGRATION_CUSTOM_ROUTE_MIN_VERSION: VersionMajorMinor = {
  major: 4,
  minor: 23,
};

export const spokeSupportsCustomMigrationsRoute = (csvVersion: string | undefined): boolean =>
  versionMeetsMajorMinorThreshold(csvVersion, STORAGE_MIGRATION_CUSTOM_ROUTE_MIN_VERSION);
