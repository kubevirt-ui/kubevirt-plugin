export const SETTINGS_TAB_QUERIES = {
  MEMORY_DENSITY_APPLIED_RATIO: `sum (sum by (name, namespace)(kubevirt_vmi_memory_domain_bytes )+ on(name, namespace) group_left() (sum by (name, namespace)(kubevirt_vmi_launcher_memory_overhead_bytes))) / 
sum(sum by (vmi_pod, namespace)(sum without (pod) ((kube_pod_resource_request{resource="memory", pod=~"virt-launcher-.*"}))))* 100`,
};
