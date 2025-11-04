import { useMemo } from 'react';

import useVirtualMachineInstanceTypes from '@catalog/CreateFromInstanceTypes/state/hooks/useVirtualMachineInstanceTypes';

import { UseInstanceTypeAndPreferencesValues } from '../utils/types';

import useClusterInstanceTypes from './useClusterInstanceTypes';
import useClusterPreferences from './useClusterPreferences';

type UseInstanceTypeAndPreferences = (
  namespace?: string,
  cluster?: string,
) => UseInstanceTypeAndPreferencesValues;

const useInstanceTypesAndPreferences: UseInstanceTypeAndPreferences = (namespace, cluster) => {
  const [clusterInstanceTypes, clusterITsLoaded, clusterITsLoadError] = useClusterInstanceTypes(
    null,
    null,
    cluster,
  );

  const [vmInstanceTypes, userITsLoaded, userITsLoadError] = useVirtualMachineInstanceTypes({
    cluster,
    namespace,
  });

  const [preferences, preferencesLoaded, preferencesLoadError] = useClusterPreferences(
    null,
    null,
    cluster,
  );

  const loaded = preferencesLoaded && clusterITsLoaded && userITsLoaded;
  const loadError = preferencesLoadError || clusterITsLoadError || userITsLoadError;

  const allInstanceTypes = useMemo(
    () => [...clusterInstanceTypes, ...vmInstanceTypes],
    [clusterInstanceTypes, vmInstanceTypes],
  );

  return {
    allInstanceTypes,
    clusterInstanceTypes,
    loaded: loaded || Boolean(loadError),
    loadError,
    preferences,
  };
};

export default useInstanceTypesAndPreferences;
