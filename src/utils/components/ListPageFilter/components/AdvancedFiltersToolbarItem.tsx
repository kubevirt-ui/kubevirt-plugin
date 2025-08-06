import React, { FC } from 'react';

import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { ToolbarFilter, ToolbarItem } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { useAdvancedFiltersParameters } from '../hooks/useAdvancedFiltersParameters';
import { useNameAndLabelParameters } from '../hooks/useNameAndLabelParameters';
import { ApplyTextFilters } from '../types';
import { getFilterLabels } from '../utils';

type AdvancedFiltersToolbarItemProps = {
  advancedFilters: RowFilter[];
  applyFilters: ApplyTextFilters;
};

const AdvancedFiltersToolbarItem: FC<AdvancedFiltersToolbarItemProps> = ({
  advancedFilters,
  applyFilters,
}) => {
  const advancedFiltersObject = useAdvancedFiltersParameters(advancedFilters);
  const nameAndLabelFiltersObject = useNameAndLabelParameters();
  const filtersObject = {
    ...advancedFiltersObject,
    ...nameAndLabelFiltersObject,
  };

  const removeFilter = (filterType: string) => applyFilters(filterType, null);

  return (
    <ToolbarItem>
      {Object.entries(filtersObject).map(([filterType, { filterGroupName, query }]) => {
        const labels = getFilterLabels(query, filterType as VirtualMachineRowFilterType);

        const deleteLabel = (_, labelToDelete: string) => {
          const newLabels = labels.filter((label) => label !== labelToDelete);
          applyFilters(filterType, newLabels);
        };

        return (
          <ToolbarFilter
            categoryName={filterGroupName}
            deleteLabel={deleteLabel}
            deleteLabelGroup={() => removeFilter(filterType)}
            key={filterType}
            labels={labels}
          >
            <></>
          </ToolbarFilter>
        );
      })}
    </ToolbarItem>
  );
};

export default AdvancedFiltersToolbarItem;
