import { type FC } from 'react';

import { INSTANCETYPE_CLASS_DISPLAY_NAME } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import InstanceTypeModal from '@kubevirt-utils/components/InstanceTypeModal/InstanceTypeModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  createTemplateInstanceTypeSubmit,
  getTemplateVirtualMachineObject,
  type Template,
} from '@kubevirt-utils/resources/template';
import useFindInstanceTypeForTemplate from '@kubevirt-utils/resources/template/hooks/useFindInstanceTypeForTemplate';
import useTemplateCPUMemoryDisplayValue from '@kubevirt-utils/resources/template/hooks/useTemplateCPUMemoryDisplayValue';
import useTemplatePageInstanceTypes from '@kubevirt-utils/resources/template/hooks/useTemplatePageInstanceTypes';
import { OLSPromptType } from '@lightspeed/utils/prompts';

type TemplateInstanceTypeDescriptionItemProps = {
  editable: boolean;
  template: Template;
};

const TemplateInstanceTypeDescriptionItem: FC<TemplateInstanceTypeDescriptionItemProps> = ({
  editable,
  template,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const templateNamespace = getNamespace(template);
  const allInstanceTypes = useTemplatePageInstanceTypes(templateNamespace);
  const currentInstanceType = useFindInstanceTypeForTemplate(template, templateNamespace);
  const { cpuMemoryText, isEmpty } = useTemplateCPUMemoryDisplayValue(template);

  const vm = getTemplateVirtualMachineObject(template);

  const onEditClick = (): void =>
    createModal?.(({ isOpen, onClose }) => (
      <InstanceTypeModal
        allInstanceTypes={allInstanceTypes}
        instanceType={currentInstanceType}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={createTemplateInstanceTypeSubmit(template)}
        vm={vm}
      />
    ));

  return (
    <DescriptionItem
      descriptionData={isEmpty ? <MutedTextSpan text={t('Unknown')} /> : cpuMemoryText}
      descriptionHeader={t('InstanceType')}
      isEdit={editable}
      olsObj={template}
      onEditClick={onEditClick}
      promptType={OLSPromptType.CPU_MEMORY}
      subTitle={
        currentInstanceType && getAnnotation(currentInstanceType, INSTANCETYPE_CLASS_DISPLAY_NAME)
      }
    />
  );
};

export default TemplateInstanceTypeDescriptionItem;
