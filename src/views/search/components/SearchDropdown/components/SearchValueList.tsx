import React, { FC, Fragment, useMemo } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Divider, MenuGroup, MenuItem, MenuList } from '@patternfly/react-core';

import { GROUPED_FILTER_KEYS, STATUS_VALUE_GROUPS } from '../constants/statusGroups';
import { getFilteredOrderedOptions } from '../utils';

type SearchValueListProps = {
  activeSegment: string;
  filterType: string;
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
  const selectedSet = useMemo(
    () => new Set(selectedValues.map((v) => v.toLowerCase())),
    [selectedValues],
  );

  const orderedOptions = useMemo(
    () => getFilteredOrderedOptions(options, activeSegment, selectedValues, filterType),
    [options, activeSegment, selectedValues, filterType],
  );

  const renderItem = (option: { label: string; value: string }, index: number) => (
    <MenuItem
      data-test={`search-value-${option.value}`}
      isFocused={index === focusedItemIndex}
      isSelected={selectedSet.has(option.value.toLowerCase())}
      itemId={option.value}
      key={option.value}
      onClick={() => onSelectValue(option.value)}
    >
      {option.label}
    </MenuItem>
  );

  if (GROUPED_FILTER_KEYS.has(filterType)) {
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
      </>
    );
  }

  return <MenuList>{orderedOptions.map((option, idx) => renderItem(option, idx))}</MenuList>;
};

export default SearchValueList;
