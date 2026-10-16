import type { UseInstanceTypeAndPreferencesValues } from '@virtualmachines/wizard/utils/types';

import {
  sceneWizardClusterInstanceTypes,
  sceneWizardRhelPreference,
} from '../stories/wizard-scene-fixtures';

const useInstanceTypesAndPreferences = (): UseInstanceTypeAndPreferencesValues => ({
  allInstanceTypes: sceneWizardClusterInstanceTypes,
  clusterInstanceTypes: sceneWizardClusterInstanceTypes,
  loaded: true,
  loadError: null,
  preferences: [sceneWizardRhelPreference],
});

export default useInstanceTypesAndPreferences;
