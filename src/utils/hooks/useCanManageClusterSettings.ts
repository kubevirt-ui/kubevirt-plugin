import useCanPatchHyperConverged from './useCanPatchHyperConverged';
import useCanUpdateFeaturesConfigMap from './useCanUpdateFeaturesConfigMap';

type UseCanManageClusterSettings = (cluster?: string) => [boolean, boolean];

/**
 * True when the user can change cluster-scoped virtualization settings
 * (HyperConverged or kubevirt-ui-features ConfigMap).
 */
const useCanManageClusterSettings: UseCanManageClusterSettings = (cluster) => {
  const [canPatchHyperConverged, hcoLoading] = useCanPatchHyperConverged(cluster);
  const [canUpdateFeaturesConfigMap, featuresLoading] = useCanUpdateFeaturesConfigMap(cluster);

  return [canPatchHyperConverged || canUpdateFeaturesConfigMap, hcoLoading || featuresLoading];
};

export default useCanManageClusterSettings;
