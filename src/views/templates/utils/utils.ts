import { TFunction } from 'i18next';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  getTemplateVirtualMachineObject,
  isVirtualMachineTemplateRequest,
  Template,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
  TemplateOrRequest,
  vCPUCount,
} from '@kubevirt-utils/resources/template';
import {
  getArchitecture as getVMArchitecture,
  getCPU,
  getMemoryCPU,
  NO_DATA_DASH,
} from '@kubevirt-utils/resources/vm';
import { getArchitecture } from '@kubevirt-utils/utils/architecture';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';

export const isCommonVMTemplate = (template: V1Template): boolean =>
  template?.metadata?.labels?.[TEMPLATE_TYPE_LABEL] === TEMPLATE_TYPE_BASE;

export const isDedicatedCPUPlacement = (template: V1Template): boolean =>
  getCPU(getTemplateVirtualMachineObject(template))?.dedicatedCpuPlacement;

export const getVirtualMachineTemplatesCPUMemoryText = (
  template: Template,
  t: TFunction,
): string => {
  const { cpu, memory } = getMemoryCPU(getTemplateVirtualMachineObject(template));

  return `${vCPUCount(cpu)} ${t('CPU')} | ${readableSizeUnit(memory) || NO_DATA_DASH} ${t(
    'Memory',
  )}`;
};

export const getTemplateArchitecture = (template: TemplateOrRequest): string | undefined => {
  if (isVirtualMachineTemplateRequest(template)) {
    return undefined;
  }
  return getArchitecture(template) ?? getVMArchitecture(getTemplateVirtualMachineObject(template));
};

export const getUniqueTemplateArchitectures = (templates: Template[]): string[] =>
  Array.from(new Set(templates.map((template) => getTemplateArchitecture(template))));
