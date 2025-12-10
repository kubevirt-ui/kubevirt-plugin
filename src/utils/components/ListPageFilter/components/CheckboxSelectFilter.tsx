import React, { FC, ReactNode, useMemo } from 'react';

import useQuery from '@kubevirt-utils/hooks/useQuery';
import { SelectProps, ToolbarFilter } from '@patternfly/react-core';
import { getRowFilterQueryKey } from '@search/utils/query';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import CheckboxSelect from '../../CheckboxSelect/CheckboxSelect';

type CheckboxSelectFilterProps = {
  allValues: { id: string; title: string }[];
  applyFilters: (type: string, value?: string[]) => void;
  badgeNumber?: number;
  categoryName: string;
  filterType: VirtualMachineRowFilterType;
  isToggleDisabled?: boolean;
  showAllBadge?: boolean;
  tooltipContent?: ReactNode;
};

const CheckboxSelectFilter: FC<CheckboxSelectFilterProps> = ({
  allValues,
  applyFilters: applyFiltersProp,
  badgeNumber,
  categoryName,
  filterType,
  isToggleDisabled = false,
  showAllBadge,
  tooltipContent,
}) => {
  const queryParams = useQuery();

  const selectedValues = useMemo(
    () => queryParams.get(getRowFilterQueryKey(filterType))?.split(',') ?? [],
    [filterType, queryParams],
  );

  const selectedOptions = useMemo(
    () => allValues.filter(({ id }) => selectedValues.includes(id)),
    [allValues, selectedValues],
  );

  const applyFilters = (values?: string[]) => applyFiltersProp(filterType, values);

  const onSelect: SelectProps['onSelect'] = (_event, value: string) => {
    if (selectedValues.includes(value)) {
      removeValue(value);
      return;
    }
    applyFilters([...selectedValues, value]);
  };

  const removeValue = (valueToRemove: string) => {
    applyFilters(selectedValues.filter((value) => value !== valueToRemove));
  };

  const getValueOfLabel = (label: string) =>
    selectedOptions.find(({ title }) => title === label)?.id;

  return (
    <ToolbarFilter
      categoryName={categoryName}
      deleteLabel={(_, label: string) => removeValue(getValueOfLabel(label))}
      deleteLabelGroup={() => applyFilters(null)}
      labels={selectedOptions.map(({ title }) => title)}
    >
      <CheckboxSelect
        options={allValues.map(({ id: value, title: children }) => ({
          children,
          isSelected: selectedValues.includes(value),
          value,
        }))}
        badgeNumber={badgeNumber}
        isToggleDisabled={isToggleDisabled}
        onSelect={onSelect}
        selectedValues={selectedValues}
        showAllBadge={showAllBadge}
        toggleTitle={categoryName}
        tooltipContent={tooltipContent}
      />
    </ToolbarFilter>
  );
};

export default CheckboxSelectFilter;
