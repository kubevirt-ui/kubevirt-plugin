import useCanPatchFeaturesConfigMap from './useCanPatchFeaturesConfigMap';
import useCanPatchHyperConverged from './useCanPatchHyperConverged';

type UseCanManageClusterSettings = (cluster?: string) => [boolean, boolean];

/**
 * True when the user can change cluster-scoped virtualization settings
 * (HyperConverged or kubevirt-ui-features ConfigMap).
 */
const useCanManageClusterSettings: UseCanManageClusterSettings = (cluster) => {
  const [canPatchHyperConverged, hcoLoading] = useCanPatchHyperConverged(cluster);
  const [canPatchFeaturesConfigMap, featuresLoading] = useCanPatchFeaturesConfigMap(cluster);

  return [canPatchHyperConverged || canPatchFeaturesConfigMap, hcoLoading || featuresLoading];
};

export default useCanManageClusterSettings;
