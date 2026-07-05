import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useClusterParam from '@multicluster/hooks/useClusterParam';

import { toggleFeatureGateAnnotation } from '../utils/featureGateAnnotation';
import { ADD_VSOCK_FEATURE_GATE_PATCH } from './constants';
import useIsVSOCKFeatureEnabled from './useIsVSOCKFeatureEnabled';

const useVSOCKFeatureFlag = (clusterOverride?: string) => {
  const clusterParam = useClusterParam();
  const cluster = clusterOverride || clusterParam;

  const { featureEnabled, isLoading: featureEnabledLoading } = useIsVSOCKFeatureEnabled(cluster);

  const [hyperConvergeConfiguration, hcConfigLoaded, hcConfigError] =
    useHyperConvergeConfiguration(cluster);

  const isAdmin = useIsAdmin();

  return {
    canEdit: isAdmin,
    error: hcConfigError,
    featureEnabled,
    loading: featureEnabledLoading || !hcConfigLoaded,
    toggleFeature: (isChecked: boolean) =>
      toggleFeatureGateAnnotation({
        cluster,
        featureGatePatch: ADD_VSOCK_FEATURE_GATE_PATCH,
        hyperConvergeConfiguration,
        isChecked,
      }),
  };
};

export default useVSOCKFeatureFlag;
