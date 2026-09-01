import { VirtualMachineClusterPreferenceModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1beta1VirtualMachineClusterPreference,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  getTemplateOSLabelName,
  getTemplatePVCName,
  type Template,
} from '@kubevirt-utils/resources/template';
import { getPreferenceMatcher } from '@kubevirt-utils/resources/vm';
import {
  getOperatingSystem,
  matchOSName,
} from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { getPreferenceIdentifierFromResourceName } from '@virtualmachines/wizard/components/BootableVolumeList/utils/utils';
import { type BootSourceOverride } from '@virtualmachines/wizard/state/vm-wizard-form/types';

import { type ChangeBootSourcePreferenceData } from './types';

export const buildBootSourceOverride = (volume: BootableVolume): BootSourceOverride => ({
  apiGroup: 'cdi.kubevirt.io',
  kind: 'DataSource',
  name: getName(volume),
  namespace: getNamespace(volume) ?? '',
});

// Templates parameterize the root disk's source DataSource (DATA_SOURCE_NAME, e.g. "win2k22",
// "rhel9"), which maps 1:1 to a VirtualMachine(Cluster)Preference name and is far more precise
// than the OS annotation, which only identifies the broad family.
const getTemplateOSVariant = (template: Template): string | undefined =>
  getPreferenceIdentifierFromResourceName(getTemplatePVCName(template));

// Fallback for custom templates without a parameterized DataSource, or an unrecognized name.
const getTemplateOSFamily = (template: Template, vm: V1VirtualMachine): string | undefined =>
  matchOSName(getTemplateOSLabelName(template), getOperatingSystem(vm))?.toLowerCase();

// Most templates don't reference a real Preference/ClusterPreference (spec.preference is
// unset), so the exact OS variant derived from the template is used to both scope the boot
// source list and, if it exists as a real cluster preference, lock the "Add new boot source"
// preference selector — never with a made-up/non-existent preference label.
export const getChangeBootSourcePreferenceData = (
  vm: V1VirtualMachine,
  template: Template,
  preferences: V1beta1VirtualMachineClusterPreference[],
): ChangeBootSourcePreferenceData => {
  const preferenceMatcher = getPreferenceMatcher(vm);
  if (preferenceMatcher?.name) {
    const lockedPreference: PreferenceOption = {
      kind: preferenceMatcher.kind,
      name: preferenceMatcher.name,
    };
    return { lockedPreference, preferenceName: preferenceMatcher.name };
  }

  const templateOSVariant = getTemplateOSVariant(template);
  const derivedPreferenceExists = preferences?.some(
    (preference) => getName(preference) === templateOSVariant,
  );

  return {
    lockedPreference: derivedPreferenceExists
      ? { kind: VirtualMachineClusterPreferenceModelGroupVersionKind.kind, name: templateOSVariant }
      : undefined,
    preferenceName: templateOSVariant ?? getTemplateOSFamily(template, vm),
  };
};
