import { WIZARD_SCENE_NAMESPACE } from '../scenes/shared/wizard-scene-constants';

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
