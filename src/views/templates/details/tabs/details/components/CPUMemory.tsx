import { type FC } from 'react';

import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import { CpuMemHelperTextResources } from '@kubevirt-utils/components/CPUDescription/utils/utils';
import { getCPUMemoryTitle } from '@kubevirt-utils/components/CPUMemory/utils';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateVirtualMachineCPU,
  type Template,
  updateTemplate,
} from '@kubevirt-utils/resources/template';
import useTemplateCPUMemoryDisplayValue from '@kubevirt-utils/resources/template/hooks/useTemplateCPUMemoryDisplayValue';
import { OLSPromptType } from '@lightspeed/utils/prompts';

import CPUMemoryModal from './CPUMemoryModal/CPUMemoryModal';

type CPUMemoryProps = {
  editable: boolean;
  template: Template;
};

const CPUMemory: FC<CPUMemoryProps> = ({ editable, template }) => {
  const { t } = useKubevirtTranslation();
  const { cpuMemoryText, isEmpty } = useTemplateCPUMemoryDisplayValue(template);
  const CPUMemData = isEmpty ? <MutedTextSpan text={t('None')} /> : cpuMemoryText;
  const { createModal } = useModal();

  const onEditClick = (): void =>
    createModal?.(({ isOpen, onClose }) => (
      <CPUMemoryModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={updateTemplate}
        template={template}
      />
    ));

  return (
    <DescriptionItem
      bodyContent={
        <CPUDescription
          cpu={getTemplateVirtualMachineCPU(template)}
          helperTextResource={CpuMemHelperTextResources.Template}
        />
      }
      descriptionData={CPUMemData}
      descriptionHeader={getCPUMemoryTitle(t)}
      isEdit={editable}
      isPopover
      olsObj={template}
      onEditClick={onEditClick}
      promptType={OLSPromptType.CPU_MEMORY}
    />
  );
};

export default CPUMemory;
