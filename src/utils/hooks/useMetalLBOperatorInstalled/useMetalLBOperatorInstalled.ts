import { DeploymentModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiAppsV1Deployment } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { LOAD_BALANCER_ENABLED } from '../useFeatures/constants';
import { useFeatures } from '../useFeatures/useFeatures';

import { METAL_LB_DEPLOYMENT_NAME, METAL_LB_DEPLOYMENT_NAMESPACE } from './constants';

export const useMetalLBOperatorInstalled = (): boolean => {
  const cluster = useClusterParam();
  const { featureEnabled, loading, toggleFeature } = useFeatures(LOAD_BALANCER_ENABLED);
  const [metalLBDeployment] = useK8sWatchData<IoK8sApiAppsV1Deployment>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(DeploymentModel),
    isList: false,
    name: METAL_LB_DEPLOYMENT_NAME,
    namespace: METAL_LB_DEPLOYMENT_NAMESPACE,
  });

  const metalLBOperatorInstalled = !isEmpty(metalLBDeployment);

  if (!featureEnabled && !loading && metalLBOperatorInstalled) toggleFeature(true);

  return metalLBOperatorInstalled;
};
