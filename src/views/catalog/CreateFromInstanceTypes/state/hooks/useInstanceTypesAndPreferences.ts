import useVirtualMachineInstanceTypes from '@catalog/CreateFromInstanceTypes/state/hooks/useVirtualMachineInstanceTypes';

import { UseInstanceTypeAndPreferencesValues } from '../utils/types';

import useClusterInstanceTypes from './useClusterInstanceTypes';
import useClusterPreferences from './useClusterPreferences';

type UseInstanceTypeAndPreferences = () => UseInstanceTypeAndPreferencesValues;

const useInstanceTypesAndPreferences: UseInstanceTypeAndPreferences = () => {
  const [clusterInstanceTypes, clusterITsLoaded, clusterITsLoadError] = useClusterInstanceTypes();

  const [vmInstanceTypes, userITsLoaded, userITsLoadError] = useVirtualMachineInstanceTypes();

  const [preferences, preferencesLoaded, preferencesLoadError] = useClusterPreferences();

  const loaded = preferencesLoaded && clusterITsLoaded && userITsLoaded;
  const loadError = preferencesLoadError || clusterITsLoadError || userITsLoadError;

  return {
    allInstanceTypes: [...clusterInstanceTypes, ...vmInstanceTypes],
    clusterInstanceTypes,
    loaded: loaded || Boolean(loadError),
    loadError,
    preferences,
  };
};

export default useInstanceTypesAndPreferences;
