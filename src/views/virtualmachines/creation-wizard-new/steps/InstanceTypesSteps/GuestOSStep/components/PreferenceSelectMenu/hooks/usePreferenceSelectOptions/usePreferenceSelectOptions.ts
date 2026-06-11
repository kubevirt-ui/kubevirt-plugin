import { useEffect, useMemo } from 'react';

import useClusterPreferences from '@kubevirt-utils/hooks/useClusterPreferences';
import useHcoWorkloadArchitectures from '@kubevirt-utils/hooks/useHcoWorkloadArchitectures';
import useUserPreferences from '@kubevirt-utils/hooks/useUserPreferences';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard-new/state/instance-type-vm-store/useInstanceTypeVMStore';
import {
  getDefaultPreference,
  getPreferenceNamesFilteredByOSType,
} from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/GuestOSStep/components/PreferenceSelectMenu/hooks/usePreferenceSelectOptions/utils/utils';
import { OperatingSystemType } from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/GuestOSStep/utils/constants';

type UsePreferenceSelectOptions = (
  namespace: string,
  cluster: string,
  operatingSystemType: OperatingSystemType,
) => {
  preferences: { kind: string; name: string }[];
  preferencesLoaded: boolean;
};

const usePreferenceSelectOptions: UsePreferenceSelectOptions = (
  namespace,
  cluster,
  operatingSystemType,
) => {
  const { preference, setPreference } = useInstanceTypeVMStore();
  const [architectures, architecturesLoaded] = useHcoWorkloadArchitectures(cluster);
  const [clusterPreferences, clusterPreferencesLoaded] = useClusterPreferences(null, null, cluster);
  const [userPreferences = [], userPreferencesLoaded] = useUserPreferences(
    namespace,
    null,
    null,
    cluster,
  );

  const preferencesLoaded = clusterPreferencesLoaded && userPreferencesLoaded;
  const loaded = preferencesLoaded && architecturesLoaded;

  const preferences = useMemo(() => {
    const allPreferences = [...(clusterPreferences || []), ...(userPreferences || [])];
    return getPreferenceNamesFilteredByOSType(allPreferences, operatingSystemType);
  }, [clusterPreferences, userPreferences, operatingSystemType]);

  useEffect(() => {
    if (!loaded) return;

    const defaultPref = getDefaultPreference(preferences, operatingSystemType, architectures);
    if (!preference && defaultPref) {
      setPreference(defaultPref);
    }
  }, [architectures, loaded, operatingSystemType, preference, preferences, setPreference]);

  return {
    preferences,
    preferencesLoaded: loaded,
  };
};

export default usePreferenceSelectOptions;
