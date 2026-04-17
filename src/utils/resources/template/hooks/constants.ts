import { VirtualMachineTemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { modelToGroupVersionKind, TemplateModel } from '@kubevirt-utils/models';

export const TemplateModelGroupVersionKind = modelToGroupVersionKind(TemplateModel);

export const VirtualMachineTemplateGroupVersionKind = modelToGroupVersionKind(
  VirtualMachineTemplateModel,
);
