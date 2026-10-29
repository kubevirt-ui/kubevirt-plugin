import {
  DEFAULT_PREFERENCE_KIND_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { type VMWizardFormValues } from '@virtualmachines/wizard/form/types';

type PreferenceFormValue = VMWizardFormValues['instanceType']['preference'];

export const getSelectedPreferenceName = (
  selectedBootableVolume: BootableVolume | null,
  preference?: PreferenceFormValue,
): string | undefined =>
  preference?.name ?? getLabel(selectedBootableVolume, DEFAULT_PREFERENCE_LABEL);

export const getSelectedPreferenceMatcher = (
  selectedBootableVolume: BootableVolume | null,
  preference?: PreferenceFormValue,
): { kind?: string; name?: string } => {
  if (preference?.name) {
    return {
      kind: preference.kind,
      name: preference.name,
    };
  }

  return {
    kind: getLabel(selectedBootableVolume, DEFAULT_PREFERENCE_KIND_LABEL, null) ?? undefined,
    name: getLabel(selectedBootableVolume, DEFAULT_PREFERENCE_LABEL),
  };
};
