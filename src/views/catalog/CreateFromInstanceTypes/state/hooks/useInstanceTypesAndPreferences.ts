import { UseInstanceTypeAndPreferencesValues } from '../utils/types';

import useClusterPreferences from './useClusterPreferences';
import useInstanceTypes from './useInstanceTypes';

type UseInstanceTypeAndPreferences = () => UseInstanceTypeAndPreferencesValues;

const useInstanceTypesAndPreferences: UseInstanceTypeAndPreferences = () => {
  const [instanceTypes, instanceTypesLoaded, instanceTypesLoadError] = useInstanceTypes();

  const [preferences, preferencesLoaded, preferencesLoadError] = useClusterPreferences();

  const loaded = preferencesLoaded && instanceTypesLoaded;
  const loadError = preferencesLoadError || instanceTypesLoadError;

  return {
    instanceTypes,
    loaded: loaded || !!loadError,
    loadError,
    preferences,
  };
};

export default useInstanceTypesAndPreferences;
