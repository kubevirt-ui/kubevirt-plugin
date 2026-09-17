import type { FC } from 'react';

import type { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import { CpuMemHelperTextResources } from '@kubevirt-utils/components/CPUDescription/utils/utils';
import { getCPUMemoryTitle } from '@kubevirt-utils/components/CPUMemory/utils';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCPU, getCPUMemoryDisplayValue, getMemory } from '@kubevirt-utils/resources/vm';
import { OLSPromptType } from '@lightspeed/utils/prompts';

type TolerationsProps = {
  vmi: V1VirtualMachineInstance;
};

const CPUMemory: FC<TolerationsProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();

  const { cpuMemoryText } = getCPUMemoryDisplayValue(getCPU(vmi), getMemory(vmi), t);

  return (
    <DescriptionItem
      bodyContent={
        <CPUDescription cpu={getCPU(vmi)} helperTextResource={CpuMemHelperTextResources.VMI} />
      }
      descriptionData={cpuMemoryText}
      descriptionHeader={getCPUMemoryTitle(t)}
      isPopover
      olsObj={vmi}
      promptType={OLSPromptType.CPU_MEMORY}
    />
  );
};

export default CPUMemory;
