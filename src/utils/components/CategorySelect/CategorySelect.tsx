import React, { type FC, useMemo, useState } from 'react';

import SelectTypeahead from '@kubevirt-utils/components/SelectTypeahead/SelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DEFAULT_TEMPLATE_CATEGORIES } from '@kubevirt-utils/resources/template';
import { toTemplateCategoryLabelValue } from '@kubevirt-utils/resources/template/utils/getTemplateCategoryLabel';
import { validateK8sLabelValue } from '@kubevirt-utils/utils/labelValidation/labelValidation';

import useCreateNewCategoryOption from './hooks/useCreateNewCategoryOption';
import { getCategorySelectOptions } from './utils/getCategorySelectOptions';

type CategorySelectProps = {
  availableCategories?: string[];
  isDisabled?: boolean;
  isFullWidth?: boolean;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
};

const CategorySelect: FC<CategorySelectProps> = ({
  availableCategories = DEFAULT_TEMPLATE_CATEGORIES,
  isDisabled = false,
  isFullWidth = true,
  selectedCategory,
  setSelectedCategory,
}) => {
  const { t } = useKubevirtTranslation();
  const [createdCategories, setCreatedCategories] = useState<string[]>([]);
  const getCreateNewCategoryOption = useCreateNewCategoryOption();

  const options = useMemo(
    () =>
      getCategorySelectOptions([...availableCategories, ...createdCategories], selectedCategory),
    [availableCategories, createdCategories, selectedCategory],
  );

  return (
    <SelectTypeahead
      addOption={(input) => {
        const normalized = toTemplateCategoryLabelValue(input);
        if (!normalized || validateK8sLabelValue(normalized, t)) {
          return false;
        }

        setCreatedCategories((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
        return normalized;
      }}
      canCreate
      dataTestId="template-category-select"
      getCreateAction={getCreateNewCategoryOption}
      getToggleStatus={(input) => {
        const normalized = toTemplateCategoryLabelValue(input);
        if (!normalized || !validateK8sLabelValue(normalized, t)) {
          return undefined;
        }
        return 'danger';
      }}
      isDisabled={isDisabled}
      isFullWidth={isFullWidth}
      options={options}
      placeholder={t('Select or create new')}
      selectedValue={selectedCategory}
      setSelectedValue={setSelectedCategory}
    />
  );
};

export default CategorySelect;
