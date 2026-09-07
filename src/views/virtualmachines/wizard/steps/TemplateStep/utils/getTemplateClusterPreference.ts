import { type V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ResourceMap } from '@kubevirt-utils/resources/shared';
import {
  getTemplateVirtualMachineObject,
  isOpenShiftTemplate,
  type Template,
} from '@kubevirt-utils/resources/template';
import { getPreferenceMatcher } from '@kubevirt-utils/resources/vm';

export const getTemplateClusterPreference = (
  template: Template,
  clusterPreferencesByName: ResourceMap<V1beta1VirtualMachineClusterPreference>,
): null | V1beta1VirtualMachineClusterPreference => {
  if (isOpenShiftTemplate(template)) {
    return null;
  }

  const vmObject = getTemplateVirtualMachineObject(template);
  const preferenceName = getPreferenceMatcher(vmObject)?.name ?? '';

  return clusterPreferencesByName[preferenceName];
};
