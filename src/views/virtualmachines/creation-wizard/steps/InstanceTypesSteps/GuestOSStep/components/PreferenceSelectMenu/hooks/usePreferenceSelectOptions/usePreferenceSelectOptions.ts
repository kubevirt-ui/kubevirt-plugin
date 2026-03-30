import { useMemo } from 'react';

import useClusterPreferences from '@kubevirt-utils/hooks/useClusterPreferences';
import useUserPreferences from '@kubevirt-utils/hooks/useUserPreferences';
import { getPreferenceNamesFilteredByOSType } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/components/PreferenceSelectMenu/hooks/usePreferenceSelectOptions/utils/utils';
import { OperatingSystemType } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';

type UsePreferenceSelectOptions = (
  namespace: string,
  cluster: string,
  operatingSystemType: OperatingSystemType,
) => {
  preferenceNames: string[];
  preferencesLoaded: boolean;
};

const usePreferenceSelectOptions: UsePreferenceSelectOptions = (
  namespace,
  cluster,
  operatingSystemType,
) => {
  const [clusterPreferences, clusterPreferencesLoaded] = useClusterPreferences(null, null, cluster);
  const [userPreferences = [], userPreferencesLoaded] = useUserPreferences(
    namespace,
    null,
    null,
    cluster,
  );

  const preferenceNames = useMemo(() => {
    const allPreferences = [...(clusterPreferences || []), ...(userPreferences || [])];
    return getPreferenceNamesFilteredByOSType(allPreferences, operatingSystemType);
  }, [clusterPreferences, userPreferences, operatingSystemType]);

  return {
    preferenceNames,
    preferencesLoaded: clusterPreferencesLoaded && userPreferencesLoaded,
  };
};

export default usePreferenceSelectOptions;
