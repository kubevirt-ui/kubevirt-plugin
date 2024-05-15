import useVirtualMachineInstanceTypes from '@catalog/CreateFromInstanceTypes/state/hooks/useVirtualMachineInstanceTypes';
import { Selector } from '@openshift-console/dynamic-plugin-sdk';

import { UseInstanceTypeAndPreferencesValues } from '../utils/types';

import useClusterInstanceTypes from './useClusterInstanceTypes';
import useClusterPreferences from './useClusterPreferences';

type UseInstanceTypeAndPreferences = (
  fieldSelector?: string,
  selector?: Selector,
) => UseInstanceTypeAndPreferencesValues;

const useInstanceTypesAndPreferences: UseInstanceTypeAndPreferences = (fieldSelector, selector) => {
  const [clusterInstanceTypes, clusterITsLoaded, clusterITsLoadError] = useClusterInstanceTypes(
    fieldSelector,
    selector,
  );

  const [vmInstanceTypes, userITsLoaded, userITsLoadError] = useVirtualMachineInstanceTypes(
    fieldSelector,
    selector,
  );

  const [preferences, preferencesLoaded, preferencesLoadError] = useClusterPreferences(
    fieldSelector,
    selector,
  );

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
