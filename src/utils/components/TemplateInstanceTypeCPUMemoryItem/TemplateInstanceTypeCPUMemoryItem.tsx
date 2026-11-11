import { type FC } from 'react';

import { INSTANCETYPE_CLASS_DISPLAY_NAME } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { getCPUMemoryTitle } from '@kubevirt-utils/components/CPUMemory/utils';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import InstanceTypeModal from '@kubevirt-utils/components/InstanceTypeModal/InstanceTypeModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import {
  createTemplateInstanceTypeSubmit,
  type Template,
} from '@kubevirt-utils/resources/template';
import { OLSPromptType } from '@lightspeed/utils/prompts';

import { useTemplateInstanceTypeCPUMemory } from './hooks/useTemplateInstanceTypeCPUMemory';
import TemplateInstanceTypeCPUMemoryDescription from './TemplateInstanceTypeCPUMemoryDescription';

type TemplateInstanceTypeCPUMemoryItemProps = {
  editable?: boolean;
  template: Template;
};

const TemplateInstanceTypeCPUMemoryItem: FC<TemplateInstanceTypeCPUMemoryItemProps> = ({
  editable = false,
  template,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { allInstanceTypes, cpuMemoryText, instanceType, instanceTypesLoaded, vm } =
    useTemplateInstanceTypeCPUMemory(template);

  const subTitle = instanceType
    ? getAnnotation(instanceType, INSTANCETYPE_CLASS_DISPLAY_NAME)
    : undefined;

  const onEditClick = (): void =>
    createModal?.(({ isOpen, onClose }) => (
      <InstanceTypeModal
        allInstanceTypes={allInstanceTypes}
        instanceType={instanceType}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={createTemplateInstanceTypeSubmit(template)}
        vm={vm}
      />
    ));

  return (
    <DescriptionItem
      descriptionData={
        <TemplateInstanceTypeCPUMemoryDescription
          cpuMemoryText={cpuMemoryText}
          instanceTypesLoaded={instanceTypesLoaded}
        />
      }
      descriptionHeader={getCPUMemoryTitle(t)}
      isEdit={editable && instanceTypesLoaded}
      olsObj={vm}
      onEditClick={editable ? onEditClick : undefined}
      promptType={OLSPromptType.CPU_MEMORY}
      subTitle={subTitle}
    />
  );
};

export default TemplateInstanceTypeCPUMemoryItem;
