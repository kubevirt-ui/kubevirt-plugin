import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  ClusterManagementAddOnModel,
  ConfigMapModel,
  modelToGroupVersionKind,
} from '@kubevirt-utils/models';
import { getAnnotation, getName } from '@kubevirt-utils/resources/shared';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import {
  OBSERVABILITY_CMA_NAMES,
  VIRTUALIZATION_OBSERVABILITY_CONFIG_MAP_NAME,
  VIRTUALIZATION_OBSERVABILITY_CONFIG_MAP_NAMESPACE,
  VIRTUALIZATION_OBSERVABILITY_DASHBOARD_ANNOTATION,
  VIRTUALIZATION_OBSERVABILITY_DASHBOARD_JSON_NAME,
} from './constants';

const isObservabilityCMA = (addon: K8sResourceCommon): boolean => {
  const name = getName(addon);
  return Boolean(name && (OBSERVABILITY_CMA_NAMES as readonly string[]).includes(name));
};

export const useVirtualizationObservabilityLink = () => {
  const [hubClusterName] = useHubClusterName();

  const [virtObservabilityConfigMap] = useK8sWatchData<IoK8sApiCoreV1ConfigMap>({
    cluster: hubClusterName,
    groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
    name: VIRTUALIZATION_OBSERVABILITY_CONFIG_MAP_NAME,
    namespace: VIRTUALIZATION_OBSERVABILITY_CONFIG_MAP_NAMESPACE,
  });

  // Watch all CMAs and accept either the legacy observability-controller or
  // MCOA's multicluster-observability-addon (CNV-93086).
  const [observabilityAddOns] = useK8sWatchData<K8sResourceCommon[]>({
    cluster: hubClusterName,
    groupVersionKind: modelToGroupVersionKind(ClusterManagementAddOnModel),
    isList: true,
  });

  const observabilityAddon = observabilityAddOns?.find(
    (addon) =>
      isObservabilityCMA(addon) &&
      getAnnotation(addon, VIRTUALIZATION_OBSERVABILITY_DASHBOARD_ANNOTATION),
  );

  const parsedDashboardData = JSON.parse(
    virtObservabilityConfigMap?.data?.[VIRTUALIZATION_OBSERVABILITY_DASHBOARD_JSON_NAME] || '{}',
  );

  const dashboardId = parsedDashboardData?.uid;

  const grafanaLink = getAnnotation(
    observabilityAddon,
    VIRTUALIZATION_OBSERVABILITY_DASHBOARD_ANNOTATION,
  );

  if (!grafanaLink || !dashboardId) return null;

  const grafanaOrigin = new URL(grafanaLink).origin;
  return `${grafanaOrigin}/d/${dashboardId}/executive-dashboards-clusters-overview?orgId=1`;
};
