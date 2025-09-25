import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  ClusterManagementAddOnModel,
  ConfigMapModel,
  modelToGroupVersionKind,
} from '@kubevirt-utils/models';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import {
  OBSERVABILITY_CONTROLLER_NAME,
  VIRTUALIZATION_OBSERVABILITY_CONFIG_MAP_NAME,
  VIRTUALIZATION_OBSERVABILITY_CONFIG_MAP_NAMESPACE,
  VIRTUALIZATION_OBSERVABILITY_DASHBOARD_ANNOTATION,
  VIRTUALIZATION_OBSERVABILITY_DASHBOARD_JSON_NAME,
} from './constants';

export const useVirtualizationObservabilityLink = () => {
  const [virtObservabilityConfigMap] = useK8sWatchData<IoK8sApiCoreV1ConfigMap>({
    groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
    name: VIRTUALIZATION_OBSERVABILITY_CONFIG_MAP_NAME,
    namespace: VIRTUALIZATION_OBSERVABILITY_CONFIG_MAP_NAMESPACE,
  });

  const [observabilityController] = useK8sWatchData({
    groupVersionKind: modelToGroupVersionKind(ClusterManagementAddOnModel),
    name: OBSERVABILITY_CONTROLLER_NAME,
  });

  const parsedDashboardData = JSON.parse(
    virtObservabilityConfigMap?.data?.[VIRTUALIZATION_OBSERVABILITY_DASHBOARD_JSON_NAME] || '{}',
  );

  const dashboardId = parsedDashboardData?.uid;

  const grafanaLink = getAnnotation(
    observabilityController,
    VIRTUALIZATION_OBSERVABILITY_DASHBOARD_ANNOTATION,
  );

  if (!grafanaLink || !dashboardId) return null;

  const grafanaOrigin = new URL(grafanaLink).origin;
  return `${grafanaOrigin}/d/${dashboardId}/executive-dashboards-clusters-overview?orgId=1`;
};
