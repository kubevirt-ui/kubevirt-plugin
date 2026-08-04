import { V1CPU } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getTemplateVirtualMachineObject, Template } from '@kubevirt-utils/resources/template';
import { getCPU, getMemory } from '@kubevirt-utils/resources/vm';
import { toQuantity } from '@kubevirt-utils/utils/units';

type CPUMemoryValues = {
  defaultCPU: V1CPU;
  defaultMemory: { defaultMemorySize: number; defaultMemoryUnit: string };
};

export const getDefaultCPUMemoryValues = (template: Template): CPUMemoryValues => {
  const vmObject = getTemplateVirtualMachineObject(template);
  const defaultCPU = getCPU(vmObject);
  const memoryQuantity = getMemory(vmObject);
  const { unit, value } = memoryQuantity
    ? toQuantity(memoryQuantity)
    : { unit: undefined, value: undefined };

  return {
    defaultCPU,
    defaultMemory: { defaultMemorySize: value, defaultMemoryUnit: unit },
  };
};
