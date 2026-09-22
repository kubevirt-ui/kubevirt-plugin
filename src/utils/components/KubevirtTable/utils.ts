import { type ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import {
  getClusterNamespaceNameKey,
  getName,
  getNamespace,
} from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { type ColumnLayout } from './types';

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
 * Uses UID when available, then cluster/namespace/name, then generateName, then kind.
 */
export const getK8sRowId = <T extends K8sResourceCommon>(resource: T): string => {
  const uid = resource?.metadata?.uid;
  if (uid) return uid;

  const cluster = getCluster(resource) ?? '';
  const namespace = getNamespace(resource) ?? '';
  const name = getName(resource) ?? resource?.metadata?.generateName ?? '';

  if (name) {
    return [cluster, namespace, name].filter(Boolean).join('/');
  }

  return resource?.kind ?? '';
};

/**
 * Stable selection identity for K8s resources.
 * Uses cluster/namespace/name so selection survives object-reference changes from resource watches.
 */
export const getK8sSelectionId = <T extends K8sResourceCommon>(resource: T): string =>
  getClusterNamespaceNameKey(
    getCluster(resource) ?? '',
    getNamespace(resource) ?? '',
    getName(resource) ?? '',
  );
