import { VirtualMachineInstancetypeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { getInstanceTypeModelFromMatcher } from '@kubevirt-utils/resources/instancetype/helper';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getTemplateVirtualMachineObject, type Template } from '@kubevirt-utils/resources/template';
import { getInstanceTypeMatcher } from '@kubevirt-utils/resources/vm';

/** Namespaced instance types are namespace-scoped; templates using them must match the destination project. */
export const isWizardCatalogTemplateVisibleForDestination = (
  template: Template,
  destinationNamespace?: string,
): boolean => {
  const matcher = getInstanceTypeMatcher(getTemplateVirtualMachineObject(template));
  if (!matcher) {
    return true;
  }

  if (getInstanceTypeModelFromMatcher(matcher).kind !== VirtualMachineInstancetypeModel.kind) {
    return true;
  }

  const destination = destinationNamespace?.trim();
  if (!destination) {
    return true;
  }

  return getNamespace(template) === destination;
};
