import React, { FC } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TemplateOrRequest } from '@kubevirt-utils/resources/template';
import { Radio, Stack } from '@patternfly/react-core';
import { TEMPLATE_SCOPE_ID } from '@templates/list/filters/useScopeFilter';

import { type UniversalFilter } from '../../../hooks/useUniversalFilter/useUniversalFilter';

type TemplatesScopeFilterProps = {
  isMenu?: boolean;
  scopeFilter: KubevirtFilter<TemplateOrRequest>;
  universalFilter: UniversalFilter;
};

const TemplatesScopeFilter: FC<TemplatesScopeFilterProps> = ({
  isMenu,
  scopeFilter,
  universalFilter,
}) => {
  const { t } = useKubevirtTranslation();
  const { hasQueryKey, isSelected, setValue } = universalFilter;
  const { id, options } = scopeFilter;

  return (
    <Stack hasGutter>
      <Radio
        data-test="catalog-template-filter-all-items"
        data-test-row-filter={TEMPLATE_SCOPE_ID.ALL}
        id={`filter-${id}-${TEMPLATE_SCOPE_ID.ALL}`}
        isChecked={!hasQueryKey(id)}
        isLabelWrapped={isMenu}
        label={t('All templates')}
        name={id}
        onChange={() => setValue(id, null)}
      />
      {options?.map(({ label, value }) => (
        <Radio
          data-test={`catalog-template-filter-${value}`}
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

export default TemplatesScopeFilter;
