import {
  VirtualMachineClusterInstancetypeModelGroupVersionKind,
  VirtualMachineClusterPreferenceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  V1alpha2VirtualMachineClusterInstancetype,
  V1alpha2VirtualMachineClusterPreference,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { UseInstanceTypeAndPreferencesValues } from '../utils/types';

type UseInstanceTypeAndPreferences = () => UseInstanceTypeAndPreferencesValues;

const useInstanceTypesAndPreferences: UseInstanceTypeAndPreferences = () => {
  const [preferences, preferencesLoaded, preferencesLoadError] = useK8sWatchResource<
    V1alpha2VirtualMachineClusterPreference[]
  >({
    groupVersionKind: VirtualMachineClusterPreferenceModelGroupVersionKind,
    isList: true,
  });

  const [instanceTypes, instanceTypesLoaded, instanceTypesLoadError] = useK8sWatchResource<
    V1alpha2VirtualMachineClusterInstancetype[]
  >({
    groupVersionKind: VirtualMachineClusterInstancetypeModelGroupVersionKind,
    isList: true,
  });

  const loaded = preferencesLoaded && instanceTypesLoaded;
  const loadError = preferencesLoadError || instanceTypesLoadError;

  const errorState = !loaded || loadError || isEmpty(preferences) || isEmpty(instanceTypes);
  return {
    preferences: errorState ? [] : preferences,
    instanceTypes: errorState ? [] : instanceTypes,
    loaded: loadError ? true : loaded,
    loadError,
  };
};

export default useInstanceTypesAndPreferences;
