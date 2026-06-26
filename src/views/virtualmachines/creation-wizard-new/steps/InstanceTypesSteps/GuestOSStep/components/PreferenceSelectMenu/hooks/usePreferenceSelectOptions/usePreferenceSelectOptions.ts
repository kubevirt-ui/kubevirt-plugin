import { useEffect, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import useClusterPreferences from '@kubevirt-utils/hooks/useClusterPreferences';
import useHcoWorkloadArchitectures from '@kubevirt-utils/hooks/useHcoWorkloadArchitectures';
import useUserPreferences from '@kubevirt-utils/hooks/useUserPreferences';
import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA } from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/consts';
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
      setValue(CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.PREFERENCE, defaultPref);
    }
  }, [architectures, loaded, operatingSystemType, preference, preferences, setValue]);

  return {
    preferences,
    preferencesLoaded: loaded,
  };
};

export default usePreferenceSelectOptions;
