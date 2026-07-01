import { useEffect, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import { PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import useClusterPreferences from '@kubevirt-utils/hooks/useClusterPreferences';
import useHcoWorkloadArchitectures from '@kubevirt-utils/hooks/useHcoWorkloadArchitectures';
import useUserPreferences from '@kubevirt-utils/hooks/useUserPreferences';
import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA } from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/consts';
import {
  getDefaultPreference,
  getSortedPreferencesByOSType,
} from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/GuestOSStep/components/PreferenceSelectMenu/hooks/usePreferenceSelectOptions/utils/utils';
import { OperatingSystemType } from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/GuestOSStep/utils/constants';

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
  const { control, setValue } = useVMWizard();
  const preference = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.PREFERENCE,
  });
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
    return getSortedPreferencesByOSType(allPreferences, operatingSystemType);
  }, [clusterPreferences, userPreferences, operatingSystemType]);

  useEffect(() => {
    if (!isPreferencesLoaded) return;

    const defaultPref = getDefaultPreference(preferences, operatingSystemType, architectures);
    if (!preference && defaultPref) {
      setValue(CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.PREFERENCE, defaultPref);
    }
  }, [architectures, isPreferencesLoaded, operatingSystemType, preference, preferences, setValue]);

  return {
    isPreferencesLoaded,
    preferences,
  };
};

export default usePreferenceSelectOptions;
