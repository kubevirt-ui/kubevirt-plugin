import { useMemo } from 'react';

import {
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ALL_NAMESPACES_SESSION_KEY, ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import useUserPreferences from '@kubevirt-utils/hooks/useUserPreferences';
import {
  convertResourceArrayToMap,
  NamespacedResourceMap,
  ResourceMap,
} from '@kubevirt-utils/resources/shared';

type UsePreferencesData = (
  volumeListNamespace: string,
  preferencesData: V1beta1VirtualMachineClusterPreference[],
) => {
  preferencesMap: ResourceMap<V1beta1VirtualMachineClusterPreference>;
  userPreferencesData: V1beta1VirtualMachinePreference[];
  userPreferencesLoaded: boolean;
  userPreferencesMap: NamespacedResourceMap<V1beta1VirtualMachinePreference>;
};

const usePreferencesData: UsePreferencesData = (volumeListNamespace, preferencesData) => {
  const [userPreferencesData, userPreferencesLoaded] = useUserPreferences(
    volumeListNamespace === ALL_PROJECTS ? ALL_NAMESPACES_SESSION_KEY : volumeListNamespace,
  );

  const preferencesMap = useMemo(
    () => convertResourceArrayToMap(preferencesData),
    [preferencesData],
  );

  const userPreferencesMap = useMemo(
    () => convertResourceArrayToMap(userPreferencesData, true),
    [userPreferencesData],
  );

  return {
    preferencesMap,
    userPreferencesData,
    userPreferencesLoaded,
    userPreferencesMap,
  };
};

export default usePreferencesData;
