import React, { type FC } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import { CpuMemHelperTextResources } from '@kubevirt-utils/components/CPUDescription/utils/utils';
import CPUMemoryDisplay from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CPUMemoryModal';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isInstanceTypeVM } from '@kubevirt-utils/resources/instancetype/helper';
import { getName } from '@kubevirt-utils/resources/shared';
import { getCPU, getMemory } from '@kubevirt-utils/resources/vm';
import { updateCustomizeInstanceType, vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { OLSPromptType } from '@lightspeed/utils/prompts';

const onSubmitCPUMemory = (updatedVM: V1VirtualMachine): Promise<undefined | V1VirtualMachine> =>
  Promise.resolve(
    updateCustomizeInstanceType([
      { data: getCPU(updatedVM), path: 'spec.template.spec.domain.cpu' },
      { data: getMemory(updatedVM), path: 'spec.template.spec.domain.memory.guest' },
    ]),
  );

const CPUMemory: FC = () => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const vm = vmSignal.value;

  if (!vm || isInstanceTypeVM(vm)) {
    return null;
  }

  return (
    <DescriptionItem
      bodyContent={
        <CPUDescription cpu={getCPU(vm)} helperTextResource={CpuMemHelperTextResources.FutureVM} />
      }
      onEditClick={() =>
        createModal?.(({ isOpen, onClose }) => (
          <CPUMemoryModal isOpen={isOpen} onClose={onClose} onSubmit={onSubmitCPUMemory} vm={vm} />
        ))
      }
      data-test={`${getName(vm)}-cpu-memory`}
      descriptionData={<CPUMemoryDisplay vm={vm} />}
      descriptionHeader={<SearchItem id="cpu-memory">{t('CPU | Memory')}</SearchItem>}
      isEdit
      isPopover
      olsObj={vm}
      promptType={OLSPromptType.CPU_MEMORY}
    />
  );
};

export default CPUMemory;
