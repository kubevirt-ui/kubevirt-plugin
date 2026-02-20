import React, { FC } from 'react';
import { useVirtualMachineTemplatesCPUMemory } from 'src/views/templates/list/hooks/useVirtualMachineTemplatesCPUMemory';

import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import { CpuMemHelperTextResources } from '@kubevirt-utils/components/CPUDescription/utils/utils';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { V1Template } from '@kubevirt-utils/models';
import { getTemplateVirtualMachineCPU, updateTemplate } from '@kubevirt-utils/resources/template';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';

import CPUMemoryModal from './CPUMemoryModal/CPUMemoryModal';

type CPUMemoryProps = {
  editable: boolean;
  template: V1Template;
};

const CPUMemory: FC<CPUMemoryProps> = ({ editable, template }) => {
  const { t } = useKubevirtTranslation();
  const CPUMemData = useVirtualMachineTemplatesCPUMemory(template);
  const { createModal } = useModal();

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <CPUMemoryModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={updateTemplate}
        template={template}
      />
    ));

  return (
    <DescriptionItem
      bodyContent={(hide) => (
        <PopoverContentWithLightspeedButton
          content={
            <CPUDescription
              cpu={getTemplateVirtualMachineCPU(template)}
              helperTextResource={CpuMemHelperTextResources.Template}
            />
          }
          hide={hide}
          obj={template}
          promptType={OLSPromptType.CPU_MEMORY}
        />
      )}
      descriptionData={CPUMemData}
      descriptionHeader={t('CPU | Memory')}
      isEdit={editable}
      isPopover
      onEditClick={onEditClick}
    />
  );
};

export default CPUMemory;
