import { useCallback, useEffect, useRef } from 'react';
import { useWatch } from 'react-hook-form';

import useHcoWorkloadArchitectures from '@kubevirt-utils/hooks/useHcoWorkloadArchitectures';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { useBootableVolumeWizardForm } from '../form/BootableVolumeWizardFormProvider';
import {
  DESTINATION_PROJECT_FIELD,
  OPERATING_SYSTEM_ARCHITECTURE_FIELD,
  OPERATING_SYSTEM_ARCHITECTURES_FIELD,
  OPERATING_SYSTEM_LABELS_FIELD,
  OPERATING_SYSTEM_LOCKED_PREFERENCE_FIELD,
} from '../form/fieldPaths';
import { wizardSetValueOptions } from '../form/wizardSetValueOptions';
import { labelKeyToClearHandlers, labelKeyToSetHandlers } from './operatingSystemLabelHandlers';

type OperatingSystemFormFields = {
  architectures: string[];
  cluster?: string;
  deleteLabel: (labelKey: string) => void;
  labels: Record<string, string>;
  lockedPreference?: string;
  namespace: string;
  setArchitectures: (architectures: string[]) => void;
  setLabel: (labelKey: string, value: string) => void;
};

const useOperatingSystemFormFields = (): OperatingSystemFormFields => {
  const { cluster, control, getValues, setValue } = useBootableVolumeWizardForm();
  const [workloadArchitectures, architecturesLoaded] = useHcoWorkloadArchitectures(cluster);
  const hasAppliedArchitectureDefaultRef = useRef(false);

  const [destinationProject, labels, architectures, lockedPreference] = useWatch({
    control,
    name: [
      DESTINATION_PROJECT_FIELD,
      OPERATING_SYSTEM_LABELS_FIELD,
      OPERATING_SYSTEM_ARCHITECTURES_FIELD,
      OPERATING_SYSTEM_LOCKED_PREFERENCE_FIELD,
    ],
  });

  useEffect(() => {
    if (hasAppliedArchitectureDefaultRef.current || !architecturesLoaded) {
      return;
    }

    if (lockedPreference || !isEmpty(architectures) || isEmpty(workloadArchitectures)) {
      hasAppliedArchitectureDefaultRef.current = true;
      return;
    }

    setValue(OPERATING_SYSTEM_ARCHITECTURES_FIELD, workloadArchitectures, wizardSetValueOptions);
    setValue(
      OPERATING_SYSTEM_ARCHITECTURE_FIELD,
      workloadArchitectures[0] ?? '',
      wizardSetValueOptions,
    );
    hasAppliedArchitectureDefaultRef.current = true;
  }, [architectures, architecturesLoaded, lockedPreference, setValue, workloadArchitectures]);

  const setLabel = useCallback(
    (labelKey: string, value: string) => {
      const nextLabels = {
        ...getValues(OPERATING_SYSTEM_LABELS_FIELD),
        [labelKey]: value,
      };
      setValue(OPERATING_SYSTEM_LABELS_FIELD, nextLabels, wizardSetValueOptions);
      labelKeyToSetHandlers[labelKey]?.(setValue, value);
    },
    [getValues, setValue],
  );

  const setArchitectures = useCallback(
    (nextArchitectures: string[]) => {
      setValue(OPERATING_SYSTEM_ARCHITECTURES_FIELD, nextArchitectures, wizardSetValueOptions);
      setValue(
        OPERATING_SYSTEM_ARCHITECTURE_FIELD,
        nextArchitectures[0] ?? '',
        wizardSetValueOptions,
      );
    },
    [setValue],
  );

  const deleteLabel = useCallback(
    (labelKey: string) => {
      const nextLabels = { ...getValues(OPERATING_SYSTEM_LABELS_FIELD) };
      delete nextLabels[labelKey];
      setValue(OPERATING_SYSTEM_LABELS_FIELD, nextLabels, wizardSetValueOptions);
      labelKeyToClearHandlers[labelKey]?.(setValue);
    },
    [getValues, setValue],
  );

  return {
    architectures: architectures ?? [],
    cluster,
    deleteLabel,
    labels: labels ?? {},
    lockedPreference,
    namespace: destinationProject ?? '',
    setArchitectures,
    setLabel,
  };
};

export default useOperatingSystemFormFields;
