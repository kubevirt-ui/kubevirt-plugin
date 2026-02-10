import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { V1Template } from '@kubevirt-utils/models';
import { getTemplateVirtualMachineObject, vCPUCount } from '@kubevirt-utils/resources/template';
import { getMemoryCPU, NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';

export const useVirtualMachineTemplatesCPUMemory = (template: V1Template): string => {
  const { t } = useKubevirtTranslation();
  const { cpu, memory } = getMemoryCPU(getTemplateVirtualMachineObject(template));

  return `${vCPUCount(cpu)} CPU | ${readableSizeUnit(memory) || NO_DATA_DASH} ${t('Memory')}`;
};
