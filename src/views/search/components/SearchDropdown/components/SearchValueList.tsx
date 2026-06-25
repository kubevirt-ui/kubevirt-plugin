import React, { FC, Fragment, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Divider, MenuGroup, MenuItem, MenuList } from '@patternfly/react-core';
import { STATUS_VALUE_GROUPS } from '@virtualmachines/utils';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils/constants';

import { ValueOption } from '../types';
import { getFilteredOrderedOptions } from '../utils';

import SearchMenuItem from './SearchMenuItem';

type SearchValueListProps = {
  activeSegment: string;
  filterType: VirtualMachineRowFilterType;
  focusedItemIndex: number;
  onSelectValue: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  selectedValues: string[];
};

const SearchValueList: FC<SearchValueListProps> = ({
  activeSegment,
  filterType,
  focusedItemIndex,
  onSelectValue,
  options,
  selectedValues,
}) => {
  const { t } = useKubevirtTranslation();

  const selectedSet = useMemo(
    () => new Set(selectedValues.map((v) => v.toLowerCase())),
    [selectedValues],
  );

  const orderedOptions = useMemo(
    () => getFilteredOrderedOptions(options, activeSegment, selectedValues, filterType),
    [options, activeSegment, selectedValues, filterType],
  );

  const hasOnlySelectedOptions = useMemo(
    () => orderedOptions.every((opt) => selectedSet.has(opt.value.toLowerCase())),
    [orderedOptions, selectedSet],
  );

  const renderItem = (option: ValueOption, index: number) => (
    <SearchMenuItem
      data-test={`search-value-${option.value}`}
      isFocused={index === focusedItemIndex}
      isSelected={selectedSet.has(option.value.toLowerCase())}
      itemId={option.value}
      key={option.value}
      onClick={() => onSelectValue(option.value)}
    >
      {option.label}
    </SearchMenuItem>
  );

  const noMatchMessage = activeSegment && hasOnlySelectedOptions && (
    <MenuItem isDisabled key="no-match">
      {t("No values found for '{{segment}}'", { segment: activeSegment })}
    </MenuItem>
  );

  if (filterType === VirtualMachineRowFilterType.Status) {
    let flatIndex = 0;
    return (
      <>
        {STATUS_VALUE_GROUPS.map((group, groupIdx) => {
          const groupItems = group
            .map((val) => orderedOptions.find((opt) => opt.value === val))
            .filter(Boolean);

          if (isEmpty(groupItems)) return null;

          const items = groupItems.map((option) => renderItem(option, flatIndex++));

          return (
            <Fragment key={groupIdx}>
              {groupIdx > 0 && <Divider />}
              <MenuGroup>
                <MenuList>{items}</MenuList>
              </MenuGroup>
            </Fragment>
          );
        })}
        {noMatchMessage}
      </>
    );
  }

  return (
    <MenuList>
      {orderedOptions.map((option, idx) => renderItem(option, idx))}
      {noMatchMessage}
    </MenuList>
  );
};

export default SearchValueList;
