import { useEffect, useMemo } from 'react';

import type { PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { OperatingSystemType } from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';

const sceneRhelPreference: PreferenceOption = {
  kind: 'VirtualMachineClusterPreference',
  name: 'rhel.9',
};

const sceneOtherLinuxPreference: PreferenceOption = {
  kind: 'VirtualMachineClusterPreference',
  name: 'centos.stream9',
};

const preferencesByOsType: Record<OperatingSystemType, PreferenceOption[]> = {
  [OperatingSystemType.OTHER_LINUX]: [sceneOtherLinuxPreference],
  [OperatingSystemType.RHEL]: [sceneRhelPreference],
  [OperatingSystemType.WINDOWS]: [],
};

const usePreferenceSelectOptions = (
  _namespace: string,
  _cluster: string,
  operatingSystemType: OperatingSystemType,
): { isPreferencesLoaded: boolean; preferences: PreferenceOption[] } => {
  const { control, setValue } = useVMWizardForm();

  const preferences = useMemo(
    () => preferencesByOsType[operatingSystemType] ?? [],
    [operatingSystemType],
  );

  useEffect(() => {
    const defaultPref = preferences[0] ?? null;
    setValue('instanceType.preference', defaultPref);
  }, [operatingSystemType, preferences, setValue]);

  return {
    isPreferencesLoaded: true,
    preferences,
  };
};

export default usePreferenceSelectOptions;
