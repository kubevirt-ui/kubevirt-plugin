import { type FC, useCallback } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import { CpuMemHelperTextResources } from '@kubevirt-utils/components/CPUDescription/utils/utils';
import CPUMemoryDisplay from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import { getCPUMemoryTitle } from '@kubevirt-utils/components/CPUMemory/utils';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CPUMemoryModal';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { getCPU } from '@kubevirt-utils/resources/vm';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { useWizardVMDraft } from '@virtualmachines/wizard/hooks/useWizardVMDraft';

type WizardNonInstanceTypeCPUMemoryProps = {
  vm: V1VirtualMachine;
};

const WizardNonInstanceTypeCPUMemory: FC<WizardNonInstanceTypeCPUMemoryProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { replaceDraft } = useWizardVMDraft();
  const vmName = getName(vm);

  const onSubmitCPUMemory = useCallback(
    (updatedVM: V1VirtualMachine): V1VirtualMachine => replaceDraft(updatedVM, vm) ?? updatedVM,
    [replaceDraft, vm],
  );

  return (
    <DescriptionItem
      bodyContent={
        <CPUDescription cpu={getCPU(vm)} helperTextResource={CpuMemHelperTextResources.FutureVM} />
      }
      data-test={`${vmName}-cpu-memory`}
      descriptionData={<CPUMemoryDisplay vm={vm} />}
      descriptionHeader={<SearchItem id="cpu-memory">{getCPUMemoryTitle(t)}</SearchItem>}
      isEdit
      isPopover
      olsObj={vm}
      onEditClick={() =>
        createModal?.(({ isOpen, onClose }) => (
          <CPUMemoryModal isOpen={isOpen} onClose={onClose} onSubmit={onSubmitCPUMemory} vm={vm} />
        ))
      }
      promptType={OLSPromptType.CPU_MEMORY}
    />
  );
};

export default WizardNonInstanceTypeCPUMemory;
