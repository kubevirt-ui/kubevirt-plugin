import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { UniversalFilter } from '@kubevirt-utils/hooks/useUniversalFilter/useUniversalFilter';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { Radio, Stack } from '@patternfly/react-core';

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
  const type = scopeFilter.type;

  return (
    <Stack hasGutter>
      <Radio
        id={`filter-${type}-all`}
        isChecked={!hasQueryKey(type)}
        isLabelWrapped={isMenu}
        label={t('All templates')}
        name={type}
        onChange={() => setValue(type, null)}
      />
      {scopeFilter.items.map((item) => (
        <Radio
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
