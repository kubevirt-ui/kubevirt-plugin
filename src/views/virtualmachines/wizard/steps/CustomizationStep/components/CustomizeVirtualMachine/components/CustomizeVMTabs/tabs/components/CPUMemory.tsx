import { type FC } from 'react';

import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import { CpuMemHelperTextResources } from '@kubevirt-utils/components/CPUDescription/utils/utils';
import CPUMemoryDisplay from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import { getCPUMemoryTitle } from '@kubevirt-utils/components/CPUMemory/utils';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CPUMemoryModal';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isInstanceTypeVM } from '@kubevirt-utils/resources/instancetype/helper';
import { getName } from '@kubevirt-utils/resources/shared';
import { getCPU } from '@kubevirt-utils/resources/vm';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { useWizardVMDraft } from '@virtualmachines/wizard/hooks/useWizardVMDraft';

const CPUMemory: FC = () => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const { replaceDraft, vmDraft: vm } = useWizardVMDraft();

  if (!vm || isInstanceTypeVM(vm)) {
    return null;
  }

  return (
    <DescriptionItem
      bodyContent={
        <CPUDescription cpu={getCPU(vm)} helperTextResource={CpuMemHelperTextResources.FutureVM} />
      }
      data-test={`${getName(vm)}-cpu-memory`}
      descriptionData={<CPUMemoryDisplay vm={vm} />}
      descriptionHeader={<SearchItem id="cpu-memory">{getCPUMemoryTitle(t)}</SearchItem>}
      isEdit
      isPopover
      olsObj={vm}
      onEditClick={() =>
        createModal?.(({ isOpen, onClose }) => (
          <CPUMemoryModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={(updatedVm) => replaceDraft(updatedVm, vm) ?? undefined}
            vm={vm}
          />
        ))
      }
      promptType={OLSPromptType.CPU_MEMORY}
    />
  );
};

export default CPUMemory;
