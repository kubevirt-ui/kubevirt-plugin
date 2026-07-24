import React, { type FC, useState } from 'react';

import CategorySelect from '@kubevirt-utils/components/CategorySelect/CategorySelect';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';

type EditCategoryModalProps = {
  availableCategories?: string[];
  initialCategory?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: string) => Promise<unknown>;
};

const EditCategoryModal: FC<EditCategoryModalProps> = ({
  availableCategories,
  initialCategory = '',
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useKubevirtTranslation();
  const [category, setCategory] = useState(initialCategory);

  return (
    <TabModal
      headerText={t('Edit category')}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => onSubmit(category)}
      shouldWrapInForm
    >
      <FormGroup fieldId="template-category" label={t('Category')}>
        <CategorySelect
          availableCategories={availableCategories}
          selectedCategory={category}
          setSelectedCategory={setCategory}
        />
      </FormGroup>
    </TabModal>
  );
};

export default EditCategoryModal;
