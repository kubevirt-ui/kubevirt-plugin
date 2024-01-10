import useUserInstanceTypes from '@catalog/CreateFromInstanceTypes/state/hooks/useUserInstanceTypes';

import { UseInstanceTypeAndPreferencesValues } from '../utils/types';

import useClusterInstanceTypes from './useClusterInstanceTypes';
import useClusterPreferences from './useClusterPreferences';

type UseInstanceTypeAndPreferences = () => UseInstanceTypeAndPreferencesValues;

const useInstanceTypesAndPreferences: UseInstanceTypeAndPreferences = () => {
  const [clusterInstanceTypes, clusterITsLoaded, clusterITsLoadError] = useClusterInstanceTypes();

  const [userInstanceTypes, userITsLoaded, userITsLoadError] = useUserInstanceTypes();

  const [preferences, preferencesLoaded, preferencesLoadError] = useClusterPreferences();

  const loaded = preferencesLoaded && clusterITsLoaded && userITsLoaded;
  const loadError = preferencesLoadError || clusterITsLoadError || userITsLoadError;

  return {
    clusterInstanceTypes,
    loaded: loaded || Boolean(loadError),
    loadError,
    preferences,
    userInstanceTypes,
  };
};

export default useInstanceTypesAndPreferences;
