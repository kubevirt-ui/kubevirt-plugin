import { useMemo } from 'react';

import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import useClusterPreferences from '@kubevirt-utils/hooks/useClusterPreferences';
import useHcoWorkloadArchitectures from '@kubevirt-utils/hooks/useHcoWorkloadArchitectures';
import useUserPreferences from '@kubevirt-utils/hooks/useUserPreferences';
import {
  getGuestOperatingSystemPreferences,
  getSortedPreferencesByOSType,
} from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/components/PreferenceSelectMenu/hooks/usePreferenceSelectOptions/utils/utils';
import { type OperatingSystemType } from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';

type UsePreferenceSelectOptions = (
  namespace: string,
  cluster: string,
  operatingSystemType: OperatingSystemType,
) => {
  isPreferencesLoaded: boolean;
  preferences: PreferenceOption[];
};

const usePreferenceSelectOptions: UsePreferenceSelectOptions = (
  namespace,
  cluster,
  operatingSystemType,
) => {
  const [architectures, architecturesLoaded] = useHcoWorkloadArchitectures(cluster);
  const [clusterPreferences, clusterPreferencesLoaded] = useClusterPreferences(null, null, cluster);
  const [userPreferences = [], userPreferencesLoaded] = useUserPreferences(
    namespace,
    null,
    null,
    cluster,
  );

  const isClusterAndUserPreferencesLoaded = clusterPreferencesLoaded && userPreferencesLoaded;
  const isPreferencesLoaded = isClusterAndUserPreferencesLoaded && architecturesLoaded;

  const preferences = useMemo(() => {
    const allPreferences = [...(clusterPreferences || []), ...(userPreferences || [])];
    return getGuestOperatingSystemPreferences(
      getSortedPreferencesByOSType(allPreferences, operatingSystemType, architectures),
    );
  }, [architectures, clusterPreferences, userPreferences, operatingSystemType]);

  return {
    isPreferencesLoaded,
    preferences,
  };
};

export default usePreferenceSelectOptions;
