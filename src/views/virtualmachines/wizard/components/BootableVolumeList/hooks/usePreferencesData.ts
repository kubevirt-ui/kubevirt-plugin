import { useMemo } from 'react';

import {
  type V1beta1VirtualMachineClusterPreference,
  type V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ALL_NAMESPACES_SESSION_KEY, ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import useUserPreferences from '@kubevirt-utils/hooks/useUserPreferences';
import {
  convertResourceArrayToMap,
  type NamespacedResourceMap,
  type ResourceMap,
} from '@kubevirt-utils/resources/shared';

type UsePreferencesData = (
  cluster: string | undefined,
  volumeListNamespace: string,
  preferencesData: V1beta1VirtualMachineClusterPreference[],
) => {
  preferencesMap: ResourceMap<V1beta1VirtualMachineClusterPreference>;
  userPreferencesData: V1beta1VirtualMachinePreference[];
  userPreferencesLoaded: boolean;
  userPreferencesMap: NamespacedResourceMap<V1beta1VirtualMachinePreference>;
};

const usePreferencesData: UsePreferencesData = (cluster, volumeListNamespace, preferencesData) => {
  const namespace =
    volumeListNamespace === ALL_PROJECTS ? ALL_NAMESPACES_SESSION_KEY : volumeListNamespace;

  const [userPreferencesData, userPreferencesLoaded] = useUserPreferences(
    namespace,
    undefined,
    undefined,
    cluster,
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
