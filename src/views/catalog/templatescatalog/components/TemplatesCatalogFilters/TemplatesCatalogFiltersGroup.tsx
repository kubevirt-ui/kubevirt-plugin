import * as React from 'react';

import {
  FilterSidePanelCategory,
  FilterSidePanelCategoryItem,
} from '@patternfly/react-catalog-view-extension';
import { Split, SplitItem } from '@patternfly/react-core';
import { Title } from '@patternfly/react-core/dist/esm/components/Title';
import { AngleDownIcon, AngleRightIcon } from '@patternfly/react-icons';

import './TemplatesCatalogFiltersGroup.scss';

export const TemplatesCatalogFiltersGroup: React.FC<{
  defaultExpanded?: boolean;
  groupKey: string;
  groupLabel?: string;
  pickedFilters: Set<string>;
  filters: {
    value: string;
    label?: string;
    count?: number;
  }[];
  onFilterClick: (type: string, value: string) => void;
}> = React.memo(
  ({ defaultExpanded = true, groupKey, groupLabel, pickedFilters, filters, onFilterClick }) => {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

    const memoFilters = React.useMemo(
      () =>
        filters.map(({ count, value, label }) => (
          <FilterSidePanelCategoryItem
            key={`${groupKey}-${label}`}
            data-test-id={`${groupKey}-${label}`}
            count={count}
            checked={pickedFilters?.has(value)}
            onClick={() => onFilterClick(groupKey, value)}
          >
            {label ?? value}
          </FilterSidePanelCategoryItem>
        )),
      [filters, pickedFilters, onFilterClick, groupKey],
    );

    return (
      <FilterSidePanelCategory data-test-id={`filter-category-${groupLabel}`}>
        {groupLabel && (
          <Split className="vm-filter-group-header" onClick={() => setIsExpanded(!isExpanded)}>
            <SplitItem>
              {isExpanded ? (
                <AngleDownIcon className="pf-c-dropdown__toggle-icon" />
              ) : (
                <AngleRightIcon className="pf-c-dropdown__toggle-icon" />
              )}
            </SplitItem>
            <SplitItem className="vm-filter-group-title" isFilled>
              <Title headingLevel="h5" size="md">
                {groupLabel}
              </Title>
            </SplitItem>
          </Split>
        )}
        {isExpanded && memoFilters}
      </FilterSidePanelCategory>
    );
  },
);
TemplatesCatalogFiltersGroup.displayName = 'TemplateFilterGroup';
