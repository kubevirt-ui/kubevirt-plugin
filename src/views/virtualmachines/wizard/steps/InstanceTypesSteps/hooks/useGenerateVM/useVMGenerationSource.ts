import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { type VMGenerationSource } from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/types';
import { type GetVMGenerationSourceArgs } from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/types';
import { getVMGenerationSource } from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/utils/getVMGenerationSource';

export const useVMGenerationSource = (
  generationSourceInputs: GetVMGenerationSourceArgs,
): VMGenerationSource => useDeepCompareMemoize(getVMGenerationSource(generationSourceInputs));
