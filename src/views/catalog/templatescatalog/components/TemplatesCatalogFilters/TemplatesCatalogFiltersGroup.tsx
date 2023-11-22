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
  filters: {
    count?: number;
    label?: string;
    value: string;
  }[];
  groupKey: string;
  groupLabel?: string;
  onFilterClick: (type: string, value: string) => void;
  pickedFilters: Set<string>;
}> = React.memo(
  ({ defaultExpanded = true, filters, groupKey, groupLabel, onFilterClick, pickedFilters }) => {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

    const memoFilters = React.useMemo(
      () =>
        filters.map(({ count, label, value }) => (
          <FilterSidePanelCategoryItem
            checked={pickedFilters?.has(value)}
            count={count}
            data-test-id={`${groupKey}-${label}`}
            key={`${groupKey}-${label}`}
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
