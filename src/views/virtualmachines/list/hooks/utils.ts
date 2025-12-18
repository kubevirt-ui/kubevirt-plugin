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

export const getVMListQueries = (
  namespaces: string[],
  clusters?: string[],
  allClusters = false,
) => {
  const namespacesFilter = isEmpty(namespaces) ? '' : `namespace=~'${namespaces.join('|')}'`;

  const clustersFilter = isEmpty(clusters) ? '' : `cluster=~'${clusters.join('|')}'`;

  const filters = [namespacesFilter, clustersFilter].filter(Boolean).join(',');

  const duration = clusters || allClusters ? '15m' : '30s';
  return {
    [VMListQueries.CPU_REQUESTED]: `kube_pod_resource_request{resource='cpu',${filters}}`,
    [VMListQueries.CPU_USAGE]: `rate(kubevirt_vmi_cpu_usage_seconds_total{${filters}}[${duration}])`,
    [VMListQueries.MEMORY_USAGE]: `kubevirt_vmi_memory_used_bytes{${filters}}`,
    [VMListQueries.NETWORK_TOTAL_USAGE]: `rate(kubevirt_vmi_network_transmit_bytes_total{${filters}}[${duration}]) + rate(kubevirt_vmi_network_receive_bytes_total{${filters}}[${duration}])`,
  };
};
