import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';

import { METRICS } from './constants';

const metricQueriesForNamespace = {
  [METRICS.MEMORY]: (namespace) =>
    `sum by (namespace)(kubevirt_vmi_memory_used_bytes{namespace="${namespace}"})`,
  [METRICS.OVERCOMMIT_RATIO]: (namespace) =>
    `(sum(kubevirt_vmi_memory_domain_bytes{namespace="${namespace}"} + on (name, namespace) group_left()(kubevirt_vmi_launcher_memory_overhead_bytes{namespace="${namespace}"}))/ (sum(kube_pod_resource_request{resource="memory", pod=~"virt-launcher-.*", namespace="${namespace}"})) * 100)`,
  [METRICS.STORAGE]: (namespace) =>
    `sum by (namespace)(max(kubevirt_vmi_filesystem_used_bytes{namespace="${namespace}"}) by (namespace, name, disk_name))`,
  [METRICS.VCPU_USAGE]: (namespace) =>
    `count(kubevirt_vmi_vcpu_wait_seconds_total{namespace="${namespace}"})`,
  [METRICS.VM]: (namespace) =>
    `sum by (namespace)(count by (name,namespace)(kubevirt_vm_error_status_last_transition_timestamp_seconds{namespace="${namespace}"} + kubevirt_vm_migrating_status_last_transition_timestamp_seconds{namespace="${namespace}"} + kubevirt_vm_non_running_status_last_transition_timestamp_seconds{namespace="${namespace}"} + kubevirt_vm_running_status_last_transition_timestamp_seconds{namespace="${namespace}"} + kubevirt_vm_starting_status_last_transition_timestamp_seconds{namespace="${namespace}"}))`,
};

const metricQueriesForAllNamespaces = {
  [METRICS.MEMORY]: () => `sum(kubevirt_vmi_memory_used_bytes)`,
  [METRICS.OVERCOMMIT_RATIO]: () =>
    `(sum(kubevirt_vmi_memory_domain_bytes + on (name, namespace) group_left()(kubevirt_vmi_launcher_memory_overhead_bytes))/ (sum(kube_pod_resource_request{resource="memory", pod=~"virt-launcher-.*"})) * 100)`,
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
