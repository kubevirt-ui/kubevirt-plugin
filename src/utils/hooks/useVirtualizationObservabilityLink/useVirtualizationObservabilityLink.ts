import { type IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  ClusterManagementAddOnModel,
  ConfigMapModel,
  modelToGroupVersionKind,
} from '@kubevirt-utils/models';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import {
  VIRTUALIZATION_OBSERVABILITY_CONFIG_MAP_NAME,
  VIRTUALIZATION_OBSERVABILITY_CONFIG_MAP_NAMESPACE,
  VIRTUALIZATION_OBSERVABILITY_DASHBOARD_ANNOTATION,
  VIRTUALIZATION_OBSERVABILITY_DASHBOARD_JSON_NAME,
} from './constants';
import { isObservabilityCMA, parseDashboardData } from './utils';

export const useVirtualizationObservabilityLink = (): null | string => {
  const [virtObservabilityConfigMap] = useK8sWatchData<IoK8sApiCoreV1ConfigMap>({
    groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
    name: VIRTUALIZATION_OBSERVABILITY_CONFIG_MAP_NAME,
    namespace: VIRTUALIZATION_OBSERVABILITY_CONFIG_MAP_NAMESPACE,
  });

  const [observabilityAddOns] = useK8sWatchData<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ClusterManagementAddOnModel),
    isList: true,
  });

  const observabilityAddon = observabilityAddOns?.find(
    (addon) =>
      isObservabilityCMA(addon) &&
      getAnnotation(addon, VIRTUALIZATION_OBSERVABILITY_DASHBOARD_ANNOTATION),
  );

  const parsedDashboardData = parseDashboardData(
    virtObservabilityConfigMap?.data?.[VIRTUALIZATION_OBSERVABILITY_DASHBOARD_JSON_NAME],
  );

  const dashboardId = parsedDashboardData.uid;

  const grafanaLink = getAnnotation(
    observabilityAddon,
    VIRTUALIZATION_OBSERVABILITY_DASHBOARD_ANNOTATION,
  );

  if (!grafanaLink || !dashboardId) return null;

  try {
    const grafanaOrigin = new URL(grafanaLink).origin;
    return `${grafanaOrigin}/d/${dashboardId}/executive-dashboards-clusters-overview?orgId=1`;
  } catch {
    return null;
  }
};
