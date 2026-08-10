import {
  DEFAULT_PREFERENCE_KIND_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { type VMWizardFormValues } from '@virtualmachines/wizard/state/vm-wizard-form/types';

type PreferenceFormValue = VMWizardFormValues['instanceTypeData']['preference'];

export const getSelectedPreferenceName = (
  selectedBootableVolume: BootableVolume | null,
  preference?: PreferenceFormValue,
): string | undefined =>
  getLabel(selectedBootableVolume, DEFAULT_PREFERENCE_LABEL) || preference?.name;

export const getSelectedPreferenceMatcher = (
  selectedBootableVolume: BootableVolume | null,
  preference?: PreferenceFormValue,
): { kind?: string; name?: string } => {
  const volumePreferenceName = getLabel(selectedBootableVolume, DEFAULT_PREFERENCE_LABEL);

  if (volumePreferenceName) {
    return {
      kind: getLabel(selectedBootableVolume, DEFAULT_PREFERENCE_KIND_LABEL, null) ?? undefined,
      name: volumePreferenceName,
    };
  }

  return {
    kind: preference?.kind,
    name: preference?.name,
  };
};
