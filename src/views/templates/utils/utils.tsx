import React, { type ReactNode } from 'react';
import { type TFunction } from 'i18next';

import { type V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import {
  getTemplateVirtualMachineObject,
  isVirtualMachineTemplateRequest,
  type Template,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
  type TemplateOrRequest,
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

export const isDedicatedCPUPlacement = (template: Template): boolean =>
  getCPU(getTemplateVirtualMachineObject(template))?.dedicatedCpuPlacement ?? false;

export const getVirtualMachineTemplatesCPUMemoryText = (
  template: Template,
  t: TFunction,
): ReactNode => {
  const { cpu, memory } = getMemoryCPU(getTemplateVirtualMachineObject(template));

  if (!cpu && !memory) {
    return <MutedTextSpan text={t('None')} />;
  }

  const cpuText = cpu ? `${vCPUCount(cpu)}` : NO_DATA_DASH;
  const memoryText = memory ? readableSizeUnit(memory) : NO_DATA_DASH;

  return (
    <>
      {cpuText} {t('CPU')} | {memoryText} {t('Memory')}
    </>
  );
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
