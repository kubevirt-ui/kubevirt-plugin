import React, { type FC } from 'react';

import { type V1beta1VirtualMachineTemplate } from '@kubevirt-ui-ext/kubevirt-api/virt-template';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import EditCategoryModal from '@kubevirt-utils/components/EditCategoryModal/EditCategoryModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateCategory, updateTemplateCategory } from '@kubevirt-utils/resources/template';

type TemplateCategoryProps = {
  editable?: boolean;
  template: V1beta1VirtualMachineTemplate;
};

const TemplateCategory: FC<TemplateCategoryProps> = ({ editable, template }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const category = getTemplateCategory(template);

  const onEditClick = (): void => {
    createModal(({ isOpen, onClose }) => (
      <EditCategoryModal
        initialCategory={category ?? ''}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={(updatedCategory) =>
          updateTemplateCategory({ category: updatedCategory, template })
        }
      />
    ));
  };

  return (
    <DescriptionItem
      data-test="template-category"
      descriptionData={category ?? <MutedTextSpan text={t('None')} />}
      descriptionHeader={t('Category')}
      isEdit={editable}
      onEditClick={onEditClick}
    />
  );
};

export default TemplateCategory;
