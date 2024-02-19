import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import { CpuMemHelperTextResources } from '@kubevirt-utils/components/CPUDescription/utils/utils';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { vCPUCount } from '@kubevirt-utils/resources/template/utils';
import { getCPU, getMemory } from '@kubevirt-utils/resources/vm';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';

type TolerationsProps = {
  vmi: V1VirtualMachineInstance;
};

const CPUMemory: FC<TolerationsProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const cpu = vCPUCount(getCPU(vmi));

  const memory = readableSizeUnit(getMemory(vmi));

  return (
    <VirtualMachineDescriptionItem
      bodyContent={
        <CPUDescription cpu={getCPU(vmi)} helperTextResource={CpuMemHelperTextResources.VMI} />
      }
      descriptionData={t('{{cpu}} CPU | {{memory}} Memory', { cpu, memory })}
      descriptionHeader={t('CPU | Memory')}
      isPopover
    />
  );
};

export default CPUMemory;
