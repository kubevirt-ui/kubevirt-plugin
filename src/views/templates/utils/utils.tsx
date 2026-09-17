import { type ReactNode } from 'react';
import { type TFunction } from 'i18next';

import { type V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import {
  getTemplateCPUMemoryDisplayValue,
  getTemplateVirtualMachineObject,
  isVirtualMachineTemplateRequest,
  type Template,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
  type TemplateOrRequest,
} from '@kubevirt-utils/resources/template';
import { getArchitecture as getVMArchitecture, getCPU } from '@kubevirt-utils/resources/vm';
import { getArchitecture } from '@kubevirt-utils/utils/architecture';

export const isCommonVMTemplate = (template: V1Template): boolean =>
  template?.metadata?.labels?.[TEMPLATE_TYPE_LABEL] === TEMPLATE_TYPE_BASE;

export const isDedicatedCPUPlacement = (template: Template): boolean =>
  getCPU(getTemplateVirtualMachineObject(template))?.dedicatedCpuPlacement ?? false;

export const getVirtualMachineTemplatesCPUMemoryValue = (
  template: Template,
  t: TFunction,
): string => {
  const { cpuMemoryText, isEmpty } = getTemplateCPUMemoryDisplayValue(template, t);

  if (isEmpty) {
    return t('None');
  }

  return cpuMemoryText;
};

export const getVirtualMachineTemplatesCPUMemoryText = (
  template: Template,
  t: TFunction,
): ReactNode => {
  const { cpuMemoryText, isEmpty } = getTemplateCPUMemoryDisplayValue(template, t);

  if (isEmpty) {
    return <MutedTextSpan text={t('None')} />;
  }

  return cpuMemoryText;
};

export const getTemplateArchitecture = (template: TemplateOrRequest): string | undefined => {
  if (isVirtualMachineTemplateRequest(template)) {
    return undefined;
  }
  return getArchitecture(template) ?? getVMArchitecture(getTemplateVirtualMachineObject(template));
};

export const getUniqueTemplateArchitectures = (templates: Template[]): string[] =>
  Array.from(
    new Set(
      templates.map((template) => getTemplateArchitecture(template)).filter(Boolean) as string[],
    ),
  );
