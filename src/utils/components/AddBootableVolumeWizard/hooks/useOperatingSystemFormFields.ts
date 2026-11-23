import { useCallback, useMemo } from 'react';
import { type UseFormSetValue, useWatch } from 'react-hook-form';

import type {
  AddBootableVolumeState,
  SetBootableVolumeFieldType,
} from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import {
  DEFAULT_INSTANCETYPE_LABEL,
  DEFAULT_PREFERENCE_KIND_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@kubevirt-utils/constants/instancetypes-and-preferences';

import { useBootableVolumeWizardForm } from '../form/BootableVolumeWizardFormProvider';
import type { BootableVolumeWizardFormValues } from '../form/types';
import { wizardSetValueOptions } from '../form/wizardSetValueOptions';

type SetOperatingSystemValue = UseFormSetValue<BootableVolumeWizardFormValues>;

type OperatingSystemFormFields = {
  bootableVolume: AddBootableVolumeState;
  deleteLabel: (labelKey: string) => void;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const labelKeyToSetHandlers: Record<
  string,
  (setValue: SetOperatingSystemValue, value: unknown) => void
> = {
  [DEFAULT_INSTANCETYPE_LABEL]: (setValue, value) => {
    setValue('operatingSystem.defaultInstanceType', String(value), wizardSetValueOptions);
  },
  [DEFAULT_PREFERENCE_KIND_LABEL]: (setValue, value) => {
    setValue('operatingSystem.preferenceKind', String(value), wizardSetValueOptions);
  },
  [DEFAULT_PREFERENCE_LABEL]: (setValue, value) => {
    setValue('operatingSystem.operatingSystem', String(value), wizardSetValueOptions);
  },
};

const labelKeyToClearHandlers: Record<string, (setValue: SetOperatingSystemValue) => void> = {
  [DEFAULT_INSTANCETYPE_LABEL]: (setValue) => {
    setValue('operatingSystem.defaultInstanceType', undefined, wizardSetValueOptions);
  },
  [DEFAULT_PREFERENCE_KIND_LABEL]: (setValue) => {
    setValue('operatingSystem.preferenceKind', undefined, wizardSetValueOptions);
  },
  [DEFAULT_PREFERENCE_LABEL]: (setValue) => {
    setValue('operatingSystem.operatingSystem', '', wizardSetValueOptions);
    setValue('operatingSystem.preference', null, wizardSetValueOptions);
  },
};

const useOperatingSystemFormFields = (): OperatingSystemFormFields => {
  const { cluster, control, getValues, setValue } = useBootableVolumeWizardForm();

  const [destinationProject, labels, architectures, lockedPreference] = useWatch({
    control,
    name: [
      'projectAndVolume.destinationProject',
      'operatingSystem.labels',
      'operatingSystem.architectures',
      'operatingSystem.lockedPreference',
    ],
  });

  const bootableVolume = useMemo(
    (): AddBootableVolumeState => ({
      architectures: architectures ?? [],
      bootableVolumeCluster: cluster,
      bootableVolumeName: '',
      bootableVolumeNamespace: destinationProject ?? '',
      labels: labels ?? {},
      lockedPreference,
      pvcName: '',
      pvcNamespace: '',
    }),
    [architectures, cluster, destinationProject, labels, lockedPreference],
  );

  const setBootableVolumeField: SetBootableVolumeFieldType = useCallback(
    (key, fieldKey) => (value) => {
      if (key === 'labels' && fieldKey) {
        const nextLabels = {
          ...getValues('operatingSystem.labels'),
          [fieldKey]: String(value),
        };
        setValue('operatingSystem.labels', nextLabels, wizardSetValueOptions);
        labelKeyToSetHandlers[fieldKey]?.(setValue, value);
        return;
      }

      if (key === 'architectures') {
        const nextArchitectures = (value as string[]) ?? [];
        setValue('operatingSystem.architectures', nextArchitectures, wizardSetValueOptions);
        setValue('operatingSystem.architecture', nextArchitectures[0] ?? '', wizardSetValueOptions);
      }
    },
    [getValues, setValue],
  );

  const deleteLabel = useCallback(
    (labelKey: string) => {
      const nextLabels = { ...getValues('operatingSystem.labels') };
      delete nextLabels[labelKey];
      setValue('operatingSystem.labels', nextLabels, wizardSetValueOptions);
      labelKeyToClearHandlers[labelKey]?.(setValue);
    },
    [getValues, setValue],
  );

  return { bootableVolume, deleteLabel, setBootableVolumeField };
};

export default useOperatingSystemFormFields;
