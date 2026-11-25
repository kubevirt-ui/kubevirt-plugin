import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import { DEFAULT_PREFERENCE_LABEL } from '@kubevirt-utils/constants/instancetypes-and-preferences';

import { useBootableVolumeWizardForm } from '../form/BootableVolumeWizardFormProvider';
import {
  OPERATING_SYSTEM_LABELS_FIELD,
  OPERATING_SYSTEM_LOCKED_PREFERENCE_FIELD,
  OPERATING_SYSTEM_PREFERENCE_FIELD,
} from '../form/fieldPaths';

/** Preference names used to filter PVC/snapshot pickers when OS is known/locked. */
const useAllowedPreferenceNames = (): string[] => {
  const { control } = useBootableVolumeWizardForm();
  const [lockedPreference, preference, labels] = useWatch({
    control,
    name: [
      OPERATING_SYSTEM_LOCKED_PREFERENCE_FIELD,
      OPERATING_SYSTEM_PREFERENCE_FIELD,
      OPERATING_SYSTEM_LABELS_FIELD,
    ],
  });

  return useMemo(() => {
    const fromAvailable = preference?.availablePreferences?.map((option) => option.name) ?? [];
    const candidates = [
      ...fromAvailable,
      lockedPreference,
      preference?.name,
      labels?.[DEFAULT_PREFERENCE_LABEL],
    ].filter((name): name is string => Boolean(name?.trim()));

    return [...new Set(candidates)];
  }, [labels, lockedPreference, preference]);
};

export default useAllowedPreferenceNames;
