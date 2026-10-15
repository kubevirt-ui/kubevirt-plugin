import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Flex, Radio } from '@patternfly/react-core';
import { hasNoDefaultUserAllFilters } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/utils/utils';

import { CATALOG_FILTERS } from '../../utils/consts';
import { TemplateFilters } from '../../utils/types';

type TemplatesCatalogRadioFiltersProps = {
  filters: TemplateFilters;
  onFilterChange: (type: CATALOG_FILTERS, value: boolean | string) => void;
};

const TemplatesCatalogRadioFilters: FC<TemplatesCatalogRadioFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const { t } = useKubevirtTranslation();

  const isDefault = filters?.onlyDefault || hasNoDefaultUserAllFilters(filters);
  const isUser = filters?.onlyUser;
  const isAll = filters?.allItems;
  const name = 'catalog-template-type';

  return (
    <Flex className="pf-v6-u-pb-md pf-v6-u-px-sm" spaceItems={{ default: 'spaceItemsLg' }}>
      <Radio
        data-test-id="catalog-template-filter-all-templates"
        id="catalog-radio-all"
        isChecked={isAll}
        isLabelWrapped
        label={t('All templates')}
        name={name}
        onChange={() => onFilterChange(CATALOG_FILTERS.ALL_ITEMS, true)}
      />
      <Radio
        data-test-id="catalog-template-filter-default-templates"
        id="catalog-radio-default"
        isChecked={isDefault}
        isLabelWrapped
        label={t('Default templates')}
        name={name}
        onChange={() => onFilterChange(CATALOG_FILTERS.ONLY_DEFAULT, true)}
      />
      <Radio
        data-test-id="catalog-template-filter-user-templates"
        id="catalog-radio-user"
        isChecked={isUser}
        isLabelWrapped
        label={t('User templates')}
        name={name}
        onChange={() => onFilterChange(CATALOG_FILTERS.ONLY_USER, true)}
      />
    </Flex>
  );
};

export default TemplatesCatalogRadioFilters;
