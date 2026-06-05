import {
  ALL_CLUSTERS,
  ALL_CLUSTERS_KEY,
  ALL_NAMESPACES,
  ALL_NAMESPACES_SESSION_KEY,
  ALL_PROJECTS,
} from '@kubevirt-utils/hooks/constants';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';

/** Column keys that must never appear in CSV export */
export const NON_EXPORTABLE_COLUMN_KEYS = new Set<string>([ACTIONS, 'selection']);

export const DEFAULT_EXPORT_FILENAME = 'table-export';

export const EXPORT_TABLE_KEYS = {
  APPLICATION_AWARE_QUOTAS: 'application-aware-quotas',
  BOOTABLE_VOLUMES: 'bootable-volumes',
  CHECKUPS_HISTORY: 'checkups-history',
  CLUSTER_INSTANCETYPES: 'cluster-instancetypes',
  DATASOURCES: 'datasources',
  MIGRATION_POLICIES: 'migration-policies',
  SELF_VALIDATION_CHECKUPS: 'self-validation-checkups',
  STORAGE_CHECKUPS: 'storage-checkups',
  STORAGE_MIGRATIONS: 'storage-migrations',
  TEMPLATES: 'templates',
  USER_INSTANCETYPES: 'user-instancetypes',
  VIRTUAL_MACHINES: 'virtual-machines',
} as const;

const normalizeCluster = (cluster: string | undefined): string | undefined => {
  if (cluster === ALL_CLUSTERS_KEY || cluster === ALL_CLUSTERS) {
    return ALL_CLUSTERS_KEY;
  }
  return cluster;
};

const normalizeNamespace = (namespace: string | undefined): string | undefined => {
  if (
    namespace === ALL_NAMESPACES_SESSION_KEY ||
    namespace === ALL_NAMESPACES ||
    namespace === ALL_PROJECTS
  ) {
    return ALL_NAMESPACES;
  }
  return namespace;
};

/**
 * Builds an export filename from cluster, namespace, and resource key.
 * @param cluster
 * @param namespace
 * @param key
 */
export type ExportTableKey = (typeof EXPORT_TABLE_KEYS)[keyof typeof EXPORT_TABLE_KEYS];

export const buildExportFilename = (
  cluster: string | undefined,
  namespace: string | undefined,
  key: `${string}-${ExportTableKey}` | ExportTableKey,
): string =>
  [normalizeCluster(cluster), normalizeNamespace(namespace), key].filter(Boolean).join('-');
