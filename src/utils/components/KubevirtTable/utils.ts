import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { ColumnLayout } from './types';

export const buildColumnLayout = <TData, TCallbacks = undefined>(
  columns: ColumnConfig<TData, TCallbacks>[],
  activeColumnKeys: string[],
  id: string,
  type = '',
): ColumnLayout => ({
  columns: columns
    .filter((col) => col.key !== ACTIONS)
    .map(({ additional, key, label }) => ({
      additional,
      id: key,
      title: label,
    })),
  id,
  selectedColumns: new Set(activeColumnKeys),
  type,
});

/**
 * Creates a unique row ID for K8s resources in tables.
 * Uses UID when available (guaranteed unique), falls back to cluster/namespace/name composite.
 *
 * @param resource - The K8s resource
 * @param index - Row index for fallback when resource has no identifying info
 * @param fallbackPrefix - Prefix for index-based fallback ID
 * @returns Unique string identifier for the row
 */
export const getK8sRowId = <T extends K8sResourceCommon>(
  resource: T,
  index: number,
  fallbackPrefix: string,
): string => {
  const uid = resource?.metadata?.uid;
  if (uid) return uid;

  const cluster = getCluster(resource) ?? '';
  const namespace = getNamespace(resource) ?? '';
  const name = getName(resource) ?? '';

  if (name) {
    return [cluster, namespace, name].filter(Boolean).join('/') || name;
  }

  return `${fallbackPrefix}-${index}`;
};
