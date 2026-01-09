import { VirtualMachineInstanceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1Pod } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { VMListQueries } from './constants';

const getVMIOwner = (resource: K8sResourceCommon) =>
  resource?.metadata?.ownerReferences?.find(
    (owner) => owner.kind === VirtualMachineInstanceModel.kind,
  );

export const getVMNamesFromPodsNames = (pods: IoK8sApiCoreV1Pod[]) => {
  return pods?.reduce((acc, pod) => {
    const vmiOwner = getVMIOwner(pod);

    if (!vmiOwner) return acc;

    acc[`${getNamespace(pod)}-${getName(pod)}`] = vmiOwner.name;

    return acc;
  }, {});
};

export const getVMListQueries = (namespaces: string[], clusters?: string[]) => {
  const namespacesFilter = isEmpty(namespaces) ? '' : `namespace=~'${namespaces.join('|')}'`;

  const clustersFilter = isEmpty(clusters) ? '' : `cluster=~'${clusters.join('|')}'`;

  const filters = [namespacesFilter, clustersFilter].filter(Boolean).join(',');

  const duration = '15m';
  return {
    [VMListQueries.CPU_USAGE]: `sum(rate(kubevirt_vmi_cpu_usage_seconds_total{${filters}}[${duration}])) BY (name, namespace, cluster)`,
    [VMListQueries.MEMORY_USAGE]: `sum(kubevirt_vmi_memory_used_bytes{${filters}}) BY (name, namespace, cluster)`,
    [VMListQueries.NETWORK_TOTAL_USAGE]: `sum(rate(kubevirt_vmi_network_transmit_bytes_total{${filters}}[${duration}]) + rate(kubevirt_vmi_network_receive_bytes_total{${filters}}[${duration}])) BY (name, namespace, cluster)`,
    [VMListQueries.STORAGE_CAPACITY]: `sum(max(kubevirt_vmi_filesystem_capacity_bytes{${filters}}) BY (name, namespace, disk_name, cluster)) BY (name, namespace, cluster)`,
    [VMListQueries.STORAGE_USAGE]: `sum(max(kubevirt_vmi_filesystem_used_bytes{${filters}}) BY (name, namespace, disk_name, cluster)) BY (name, namespace, cluster)`,
  };
};
