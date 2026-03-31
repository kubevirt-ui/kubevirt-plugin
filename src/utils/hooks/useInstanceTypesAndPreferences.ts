import { useMemo } from 'react';

import useClusterInstanceTypes from '@kubevirt-utils/hooks/useClusterInstanceTypes';
import useClusterPreferences from '@kubevirt-utils/hooks/useClusterPreferences';
import useVirtualMachineInstanceTypes from '@kubevirt-utils/hooks/useVirtualMachineInstanceTypes';
import { UseInstanceTypeAndPreferencesValues } from '@virtualmachines/creation-wizard/utils/types';

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
