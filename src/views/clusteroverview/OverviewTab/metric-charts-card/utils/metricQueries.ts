import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';

import { METRICS } from './constants';

const metricQueriesForNamespace = {
  [METRICS.MEMORY]: (namespace) =>
    `sum by (namespace)(kubevirt_vmi_memory_used_bytes{namespace="${namespace}"})`,
  [METRICS.STORAGE]: (namespace) =>
    `sum by (namespace)(max(kubevirt_vmi_filesystem_used_bytes{namespace="${namespace}"}) by (namespace, name, disk_name))`,
  [METRICS.VCPU_USAGE]: (namespace) =>
    `count(kubevirt_vmi_vcpu_wait_seconds_total{namespace="${namespace}"})`,
  [METRICS.VM]: (namespace) =>
    `sum by (namespace)(count by (name,namespace)(kubevirt_vm_error_status_last_transition_timestamp_seconds{namespace="${namespace}"} + kubevirt_vm_migrating_status_last_transition_timestamp_seconds{namespace="${namespace}"} + kubevirt_vm_non_running_status_last_transition_timestamp_seconds{namespace="${namespace}"} + kubevirt_vm_running_status_last_transition_timestamp_seconds{namespace="${namespace}"} + kubevirt_vm_starting_status_last_transition_timestamp_seconds{namespace="${namespace}"}))`,
};

const metricQueriesForAllNamespaces = {
  [METRICS.MEMORY]: () => `sum(kubevirt_vmi_memory_used_bytes)`,
  [METRICS.STORAGE]: () =>
    `sum(max(kubevirt_vmi_filesystem_used_bytes) by (namespace, name, disk_name))`,
  [METRICS.VCPU_USAGE]: () => `count(kubevirt_vmi_vcpu_wait_seconds_total)`,
  [METRICS.VM]: () =>
    `sum(count by (name,namespace)(kubevirt_vm_error_status_last_transition_timestamp_seconds + kubevirt_vm_migrating_status_last_transition_timestamp_seconds + kubevirt_vm_non_running_status_last_transition_timestamp_seconds + kubevirt_vm_running_status_last_transition_timestamp_seconds + kubevirt_vm_starting_status_last_transition_timestamp_seconds))`,
};

export const getMetricQuery = (metric: string, namespace: string) =>
  namespace === ALL_NAMESPACES_SESSION_KEY
    ? metricQueriesForAllNamespaces[metric]()
    : metricQueriesForNamespace?.[metric]?.(namespace);
