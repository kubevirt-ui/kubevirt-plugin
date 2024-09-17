import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1CPU } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getMemorySize } from '@kubevirt-utils/components/CPUMemoryModal/utils/CpuMemoryUtils';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getCPU, getMemory } from '@kubevirt-utils/resources/vm';

type CPUMemoryValues = {
  defaultCPU: V1CPU;
  defaultMemory: { defaultMemorySize: number; defaultMemoryUnit: string };
};

export const getDefaultCPUMemoryValues = (template: V1Template): CPUMemoryValues => {
  const vmObject = getTemplateVirtualMachineObject(template);
  const defaultCPU = getCPU(vmObject);
  const defaultMemory = getMemorySize(getMemory(vmObject));
  const { size, unit } = defaultMemory;

  return { defaultCPU, defaultMemory: { defaultMemorySize: size, defaultMemoryUnit: unit } };
};
