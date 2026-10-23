/**
 * Gallery alias for `useWizardInitialValues`.
 * Pins wizard deployment location to the scene namespace and a single local cluster.
 */
import { WIZARD_SCENE_NAMESPACE } from '../stories/wizard-scene-constants';

/** Initial cluster/namespace for VM creation wizard gallery stories. */
const useWizardInitialValues = (): {
  cluster: string;
  hubClusterError: undefined;
  isLoadingHubCluster: boolean;
  namespace: string;
} => ({
  cluster: 'local-cluster',
  hubClusterError: undefined,
  isLoadingHubCluster: false,
  namespace: WIZARD_SCENE_NAMESPACE,
});

export default useWizardInitialValues;
