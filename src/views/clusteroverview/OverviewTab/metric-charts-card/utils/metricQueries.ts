import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';

import { METRICS } from './constants';

const metricQueriesForNamespace = {
  [METRICS.VM]: (namespace) =>
    `sum by (namespace)(count by (name,namespace)(kubevirt_vm_error_status_last_transition_timestamp_seconds{namespace="${namespace}"} + kubevirt_vm_migrating_status_last_transition_timestamp_seconds{namespace="${namespace}"} + kubevirt_vm_non_running_status_last_transition_timestamp_seconds{namespace="${namespace}"} + kubevirt_vm_running_status_last_transition_timestamp_seconds{namespace="${namespace}"} + kubevirt_vm_starting_status_last_transition_timestamp_seconds{namespace="${namespace}"}))`,
  [METRICS.VCPU_USAGE]: (namespace) => `sum(kubevirt_vmi_vcpu_seconds) by (${namespace})`,
  [METRICS.MEMORY]: (namespace) =>
    `sum(kubevirt_vmi_memory_available_bytes - kubevirt_vmi_memory_usable_bytes) by (${namespace})`,
  [METRICS.STORAGE]: (namespace) => `sum(kubevirt_vmi_filesystem_used_bytes) by (${namespace})`,
};

const metricQueriesForAllNamespaces = {
  [METRICS.VM]: () =>
    `sum(count by (name,namespace)(kubevirt_vm_error_status_last_transition_timestamp_seconds + kubevirt_vm_migrating_status_last_transition_timestamp_seconds + kubevirt_vm_non_running_status_last_transition_timestamp_seconds + kubevirt_vm_running_status_last_transition_timestamp_seconds + kubevirt_vm_starting_status_last_transition_timestamp_seconds))`,
  [METRICS.VCPU_USAGE]: () => `sum(kubevirt_vmi_vcpu_seconds)`,
  [METRICS.MEMORY]: () =>
    `sum(kubevirt_vmi_memory_available_bytes - kubevirt_vmi_memory_usable_bytes)`,
  [METRICS.STORAGE]: () => `sum(kubevirt_vmi_filesystem_used_bytes)`,
};

export const getMetricQuery = (metric: string, namespace: string) =>
  namespace === ALL_NAMESPACES_SESSION_KEY
    ? metricQueriesForAllNamespaces[metric]()
    : metricQueriesForNamespace?.[metric]?.(namespace);
