import React, { type FC } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type TemplateOrRequest } from '@kubevirt-utils/resources/template';
import { Radio, Stack } from '@patternfly/react-core';
import { TEMPLATE_CATEGORY_FILTER_ALL } from '@templates/list/filters/useCategoryFilter';

import { type UniversalFilter } from '../../../hooks/useUniversalFilter/useUniversalFilter';

type TemplatesCategoryFilterProps = {
  isMenu?: boolean;
  filterDefinition: KubevirtFilter<TemplateOrRequest>;
  universalFilter: UniversalFilter;
};

const TemplatesCategoryFilter: FC<TemplatesCategoryFilterProps> = ({
  isMenu,
  filterDefinition,
  universalFilter,
}) => {
  const { t } = useKubevirtTranslation();
  const { hasQueryKey, isSelected, setValue } = universalFilter;
  const { id, options } = filterDefinition;

  return (
    <Stack hasGutter>
      <h5 className="pf-v6-u-text-color-subtle">{filterDefinition.categoryLabel}</h5>
      <Radio
        data-test={`template-category-filter-${TEMPLATE_CATEGORY_FILTER_ALL}`}
        data-test-row-filter={TEMPLATE_CATEGORY_FILTER_ALL}
        id={`filter-${id}-${TEMPLATE_CATEGORY_FILTER_ALL}`}
        isChecked={!hasQueryKey(id)}
        isLabelWrapped={isMenu}
        label={t('All templates')}
        name={id}
        onChange={() => setValue(id, null)}
      />
      {options?.map(({ label, value }) => (
        <Radio
          data-test={`template-category-filter-${value}`}
          data-test-row-filter={value}
          id={`filter-${id}-${value}`}
          isChecked={isSelected(id, value)}
          isLabelWrapped={isMenu}
          key={value}
          label={label}
          name={id}
          onChange={() => setValue(id, value)}
        />
      ))}
    </Stack>
  );
};

export default TemplatesCategoryFilter;
