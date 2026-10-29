import { useEffect, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import isEqual from 'lodash/isEqual';

import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import useClusterPreferences from '@kubevirt-utils/hooks/useClusterPreferences';
import useHcoWorkloadArchitectures from '@kubevirt-utils/hooks/useHcoWorkloadArchitectures';
import useUserPreferences from '@kubevirt-utils/hooks/useUserPreferences';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { resolveGuestOSSelection } from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/components/PreferenceSelectMenu/hooks/usePreferenceSelectOptions/utils/preferenceSelectionUtils';
import {
  getGuestOperatingSystemPreferences,
  getSortedPreferencesByOSType,
} from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/components/PreferenceSelectMenu/hooks/usePreferenceSelectOptions/utils/utils';
import { type OperatingSystemType } from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';
import { resetBootableVolumeFields } from '@virtualmachines/wizard/utils/utils';

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
  const { control, setValue } = useVMWizardForm();
  const [guestOperatingSystem, selectedPreference] = useWatch({
    control,
    name: ['instanceType.guestOperatingSystem', 'instanceType.preference'],
  });

  const [architectures, architecturesLoaded] = useHcoWorkloadArchitectures(cluster);
  const [clusterPreferences, clusterPreferencesLoaded, clusterPreferencesError] =
    useClusterPreferences(null, null, cluster);
  const [userPreferences = [], userPreferencesLoaded, userPreferencesError] = useUserPreferences(
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

  const { nextGuestOperatingSystem, shouldResetBootSource } = resolveGuestOSSelection(
    preferences,
    guestOperatingSystem,
    selectedPreference,
  );

  useEffect(() => {
    if (!isPreferencesLoaded || clusterPreferencesError || userPreferencesError) return;

    if (shouldResetBootSource) {
      resetBootableVolumeFields(setValue);
    }

    if (!isEqual(guestOperatingSystem, nextGuestOperatingSystem)) {
      setValue('instanceType.guestOperatingSystem', nextGuestOperatingSystem, {
        shouldValidate: true,
      });
    }
  }, [
    clusterPreferencesError,
    guestOperatingSystem,
    isPreferencesLoaded,
    nextGuestOperatingSystem,
    setValue,
    shouldResetBootSource,
    userPreferencesError,
  ]);

  return {
    isPreferencesLoaded,
    preferences,
  };
};

export default usePreferenceSelectOptions;
