import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import { escapePromLabelValue } from '@kubevirt-utils/utils/prometheus';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetPrometheusPoll, useHubClusterName } from '@stolostron/multicluster-sdk';

const HAS_PANIC_DEVICE_LABEL = 'has_panic_device';

/**
 * Reads the has_panic_device label from kubevirt_vmi_info for a VM.
 * Returns [value, loaded]: true/false when the metric is available, otherwise undefined.
 * loaded is false only while an issued query is still pending.
 */
const useHasPanicDeviceMetric = (
  vm: V1VirtualMachine,
  enabled: boolean,
): [boolean | undefined, boolean] => {
  const name = getName(vm);
  const namespace = getNamespace(vm);
  const uid = getUID(vm);
  const cluster = getCluster(vm);
  const [hubClusterName] = useHubClusterName();

  const isManagedCluster = !isEmpty(cluster) && cluster !== hubClusterName;
  const clusterFilter = isManagedCluster ? `,cluster='${escapePromLabelValue(cluster)}'` : '';

  const query =
    enabled && name && namespace && uid
      ? `kubevirt_vmi_info{name='${escapePromLabelValue(name)}',namespace='${escapePromLabelValue(namespace)}'${clusterFilter}}`
      : undefined;

  const [response, loaded] = useFleetPrometheusPoll({
    cluster,
    endpoint: PrometheusEndpoint.QUERY,
    namespace,
    query,
  });

  if (!query) {
    return [undefined, true];
  }

  const labelValue = response?.data?.result?.[0]?.metric?.[HAS_PANIC_DEVICE_LABEL];

  if (labelValue === 'true') {
    return [true, loaded];
  }

  if (labelValue === 'false') {
    return [false, loaded];
  }

  return [undefined, loaded];
};

export default useHasPanicDeviceMetric;
