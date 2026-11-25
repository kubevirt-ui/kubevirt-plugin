import type { UseFormSetValue } from 'react-hook-form';

import {
  DEFAULT_INSTANCETYPE_LABEL,
  DEFAULT_PREFERENCE_KIND_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@kubevirt-utils/constants/instancetypes-and-preferences';

import {
  OPERATING_SYSTEM_DEFAULT_INSTANCE_TYPE_FIELD,
  OPERATING_SYSTEM_FIELD,
  OPERATING_SYSTEM_PREFERENCE_FIELD,
  OPERATING_SYSTEM_PREFERENCE_KIND_FIELD,
} from '../form/fieldPaths';
import type { BootableVolumeWizardFormValues } from '../form/types';
import { wizardSetValueOptions } from '../form/wizardSetValueOptions';

type SetOperatingSystemValue = UseFormSetValue<BootableVolumeWizardFormValues>;

export const labelKeyToSetHandlers: Record<
  string,
  (setValue: SetOperatingSystemValue, value: unknown) => void
> = {
  [DEFAULT_INSTANCETYPE_LABEL]: (setValue, value) => {
    setValue(OPERATING_SYSTEM_DEFAULT_INSTANCE_TYPE_FIELD, String(value), wizardSetValueOptions);
  },
  [DEFAULT_PREFERENCE_KIND_LABEL]: (setValue, value) => {
    setValue(OPERATING_SYSTEM_PREFERENCE_KIND_FIELD, String(value), wizardSetValueOptions);
  },
  [DEFAULT_PREFERENCE_LABEL]: (setValue, value) => {
    setValue(OPERATING_SYSTEM_FIELD, String(value), wizardSetValueOptions);
  },
};

export const labelKeyToClearHandlers: Record<string, (setValue: SetOperatingSystemValue) => void> =
  {
    [DEFAULT_INSTANCETYPE_LABEL]: (setValue) => {
      setValue(OPERATING_SYSTEM_DEFAULT_INSTANCE_TYPE_FIELD, undefined, wizardSetValueOptions);
    },
    [DEFAULT_PREFERENCE_KIND_LABEL]: (setValue) => {
      setValue(OPERATING_SYSTEM_PREFERENCE_KIND_FIELD, undefined, wizardSetValueOptions);
    },
    [DEFAULT_PREFERENCE_LABEL]: (setValue) => {
      setValue(OPERATING_SYSTEM_FIELD, '', wizardSetValueOptions);
      setValue(OPERATING_SYSTEM_PREFERENCE_FIELD, null, wizardSetValueOptions);
    },
  };
