import React, { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type UniversalFilter } from '@kubevirt-utils/hooks/useUniversalFilter/useUniversalFilter';
import { type RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { Radio, Stack } from '@patternfly/react-core';
import { TEMPLATE_CATEGORY_FILTER_ALL } from '@templates/list/filters/useCategoryFilter';

type TemplatesCategoryFilterProps = {
  isMenu?: boolean;
  rowFilter: RowFilter;
  universalFilter: UniversalFilter;
};

const TemplatesCategoryFilter: FC<TemplatesCategoryFilterProps> = ({
  isMenu,
  rowFilter,
  universalFilter,
}) => {
  const { t } = useKubevirtTranslation();
  const { hasQueryKey, isSelected, setValue } = universalFilter;
  const { items, type } = rowFilter;

  return (
    <Stack hasGutter>
      <h5 className="pf-v6-u-text-color-subtle">{rowFilter.filterGroupName}</h5>
      <Radio
        data-test={`template-category-filter-${TEMPLATE_CATEGORY_FILTER_ALL}`}
        data-test-row-filter={TEMPLATE_CATEGORY_FILTER_ALL}
        id={`filter-${type}-${TEMPLATE_CATEGORY_FILTER_ALL}`}
        isChecked={!hasQueryKey(type)}
        isLabelWrapped={isMenu}
        label={t('All templates')}
        name={type}
        onChange={() => setValue(type, null)}
      />
      {items.map((item) => (
        <Radio
          data-test={`template-category-filter-${item.id}`}
          data-test-row-filter={item.id}
          id={`filter-${type}-${item.id}`}
          isChecked={isSelected(type, item.id)}
          isLabelWrapped={isMenu}
          key={item.id}
          label={item.title}
          name={type}
          onChange={() => setValue(type, item.id)}
        />
      ))}
    </Stack>
  );
};

export default TemplatesCategoryFilter;
