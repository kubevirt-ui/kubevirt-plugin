import {
  TemplateModel,
  V1Template,
  VirtualMachineTemplateModel,
  VirtualMachineTemplateRequestModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1alpha1VirtualMachineTemplate,
  V1alpha1VirtualMachineTemplateRequest,
} from '@kubevirt-ui-ext/kubevirt-api/virt-template';

export type Template = V1alpha1VirtualMachineTemplate | V1Template;

export type TemplateOrRequest = Template | V1alpha1VirtualMachineTemplateRequest;

export const isVirtualMachineTemplate = (
  obj: TemplateOrRequest,
): obj is V1alpha1VirtualMachineTemplate => obj?.kind === VirtualMachineTemplateModel.kind;

export const isVirtualMachineTemplateRequest = (
  obj: TemplateOrRequest,
): obj is V1alpha1VirtualMachineTemplateRequest =>
  obj?.kind === VirtualMachineTemplateRequestModel.kind;

export const isOpenShiftTemplate = (obj: TemplateOrRequest): obj is V1Template =>
  obj?.kind === TemplateModel.kind;
