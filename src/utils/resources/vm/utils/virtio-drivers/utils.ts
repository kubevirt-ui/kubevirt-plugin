import { type TFunction } from 'i18next';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getClusterNamespaceNameKey,
  getName,
  getNamespace,
} from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { type PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';

export const getOutdatedVirtioVmKey = (vm: V1VirtualMachine): string =>
  getClusterNamespaceNameKey(getCluster(vm) ?? '', getNamespace(vm) ?? '', getName(vm) ?? '');

/**
 * Returns true when the VM appears in the Prometheus-derived outdated set.
 * Matches both cluster-scoped and clusterless keys so ACM VMs still match
 * when the recording-rule series omit a cluster label.
 */
export const hasOutdatedVirtioDrivers = (
  vm: V1VirtualMachine,
  outdatedVmKeys: Set<string>,
): boolean => {
  const namespace = getNamespace(vm) ?? '';
  const name = getName(vm) ?? '';
  const clusterKey = getOutdatedVirtioVmKey(vm);
  const namespaceNameKey = getClusterNamespaceNameKey('', namespace, name);

  return outdatedVmKeys.has(clusterKey) || outdatedVmKeys.has(namespaceNameKey);
};

export const parseOutdatedVirtioVmKeys = (response?: PrometheusResponse): Set<string> => {
  const keys = new Set<string>();

  for (const result of response?.data?.result ?? []) {
    const namespace = result?.metric?.namespace;
    const name = result?.metric?.name;

    if (!namespace || !name) {
      continue;
    }

    keys.add(getClusterNamespaceNameKey(result?.metric?.cluster ?? '', namespace, name));
  }

  return keys;
};

export const getOutdatedDriversAlertTitle = (vmsCount: number, t: TFunction): string | null => {
  if (vmsCount === 0) {
    return null;
  }

  if (vmsCount === 1) {
    return t('1 Windows VM has outdated VirtIO drivers');
  }

  return t('{{vmsCount}} Windows VMs have outdated VirtIO drivers', { vmsCount });
};
