import { TFunction } from 'i18next';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  getTemplateVirtualMachineObject,
  Template,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
  vCPUCount,
} from '@kubevirt-utils/resources/template';
import { getCPU, getMemoryCPU, NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
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
