import { type V1CPU } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getTemplateVirtualMachineObject, type Template } from '@kubevirt-utils/resources/template';
import { getCPU, getMemory } from '@kubevirt-utils/resources/vm';
import { type Quantity } from '@kubevirt-utils/types/quantity';
import { toQuantity } from '@kubevirt-utils/utils/units';

type CPUMemoryValues = {
  defaultCPU: undefined | V1CPU;
  defaultMemory: Quantity | undefined;
};

export const getDefaultCPUMemoryValues = (template: Template): CPUMemoryValues => {
  const vmObject = getTemplateVirtualMachineObject(template);
  const defaultCPU = getCPU(vmObject);
  const defaultMemory = toQuantity(getMemory(vmObject));

  return {
    defaultCPU,
    defaultMemory,
  };
};
