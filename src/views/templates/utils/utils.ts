import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import {
  getTemplateVirtualMachineObject,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
} from '@kubevirt-utils/resources/template';
import { getCPU } from '@kubevirt-utils/resources/vm';

export const isCommonVMTemplate = (template: V1Template): boolean =>
  template?.metadata?.labels?.[TEMPLATE_TYPE_LABEL] === TEMPLATE_TYPE_BASE;

export const isDedicatedCPUPlacement = (template: V1Template): boolean =>
  getCPU(getTemplateVirtualMachineObject(template))?.dedicatedCpuPlacement;
