import React, { FC } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { ToolbarFilter, ToolbarItem } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { useAdvancedFiltersParameters } from '../hooks/useAdvancedFiltersParameters';
import { ApplyTextFilters } from '../types';
import { getFilterLabels } from '../utils';

import ProjectFilter from './ProjectFilter';

type AdvancedFiltersToolbarItemProps = {
  advancedFilters: RowFilter[];
  applyTextFilters: ApplyTextFilters;
  showProjectFilter: boolean;
};

const AdvancedFiltersToolbarItem: FC<AdvancedFiltersToolbarItemProps> = ({
  advancedFilters,
  applyTextFilters,
  showProjectFilter,
}) => {
  const advancedFiltersObject = useAdvancedFiltersParameters(advancedFilters);

  if (!showProjectFilter && isEmpty(advancedFilters)) {
    return null;
  }

  return (
    <ToolbarItem>
      {showProjectFilter && <ProjectFilter applyTextFilters={applyTextFilters} />}
      {advancedFilters?.map((filter) => (
        <ToolbarFilter
          labels={getFilterLabels(
            advancedFiltersObject[filter.type],
            filter.type as VirtualMachineRowFilterType,
          )}
          categoryName={filter.filterGroupName}
          deleteLabel={() => applyTextFilters(filter.type)}
          key={filter.type}
        >
          <></>
        </ToolbarFilter>
      ))}
    </ToolbarItem>
  );
};

export default AdvancedFiltersToolbarItem;
