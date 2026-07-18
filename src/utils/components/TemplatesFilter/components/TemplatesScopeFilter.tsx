import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { UniversalFilter } from '@kubevirt-utils/hooks/useUniversalFilter/useUniversalFilter';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { Radio, Stack } from '@patternfly/react-core';
import { TEMPLATE_SCOPE_ID } from '@templates/list/filters/useScopeFilter';

type TemplatesScopeFilterProps = {
  isMenu?: boolean;
  scopeFilter: RowFilter;
  universalFilter: UniversalFilter;
};

const TemplatesScopeFilter: FC<TemplatesScopeFilterProps> = ({
  isMenu,
  scopeFilter,
  universalFilter,
}) => {
  const { t } = useKubevirtTranslation();
  const { hasQueryKey, isSelected, setValue } = universalFilter;
  const { items, type } = scopeFilter;

  return (
    <Stack hasGutter>
      <Radio
        ouiaId="catalog-template-filter-all-items"
        data-test-row-filter={TEMPLATE_SCOPE_ID.ALL}
        id={`filter-${type}-${TEMPLATE_SCOPE_ID.ALL}`}
        isChecked={!hasQueryKey(type)}
        isLabelWrapped={isMenu}
        label={t('All templates')}
        name={type}
        onChange={() => setValue(type, null)}
      />
      {items.map((item) => (
        <Radio
          ouiaId={`catalog-template-filter-${item.id}`}
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

export default TemplatesScopeFilter;
