/**
 * Gallery alias for `@kubevirt-utils/hooks/useInstanceTypesAndPreferences`.
 * Instance types and RHEL preference from `wizard-scene-fixtures`.
 */
import type { UseInstanceTypeAndPreferencesValues } from '@virtualmachines/wizard/utils/types';

import {
  sceneWizardClusterInstanceTypes,
  sceneWizardRhelPreference,
} from '../stories/wizard-scene-fixtures';

/** Static cluster instance types + preferences for guest OS / compute steps. */
const useInstanceTypesAndPreferences = (): UseInstanceTypeAndPreferencesValues => ({
  allInstanceTypes: sceneWizardClusterInstanceTypes,
  clusterInstanceTypes: sceneWizardClusterInstanceTypes,
  loaded: true,
  loadError: null,
  preferences: [sceneWizardRhelPreference],
});

export default useInstanceTypesAndPreferences;
