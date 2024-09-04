import React, { FC, ReactNode, SyntheticEvent, useMemo, useState } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Divider,
  MenuSearch,
  MenuSearchInput,
  MenuToggleProps,
  SearchInput,
  Select,
  SelectList,
  SelectPopperProps,
} from '@patternfly/react-core';

import SelectToggle from '../toggles/SelectToggle';

import InlineFilterSelectOptionContent from './components/InlineFilterSelectOptionContent';
import InlineFilterSelectOptions from './components/InlineFilterSelectOptions';
import { NO_RESULTS } from './utils/constants';
import { EnhancedSelectOptionProps } from './utils/types';
import { getGroupedOptions } from './utils/utils';

type InlineFilterSelectProps = {
  className?: string;
  menuFooter?: ReactNode;
  optionLabelText?: string;
  options: EnhancedSelectOptionProps[];
  popperProps?: SelectPopperProps;
  selected: string;
  setSelected: (val: string) => void;
  toggleProps?: MenuToggleProps;
};

const InlineFilterSelect: FC<InlineFilterSelectProps> = ({
  className,
  menuFooter,
  options = [],
  popperProps,
  selected,
  setSelected,
  toggleProps,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [filterValue, setFilterValue] = useState<string>('');
  const [focusedItemIndex, setFocusedItemIndex] = useState<null | number>(null);

  const onToggle = () => setIsOpen((prevIsOpen) => !prevIsOpen);

  const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string) => {
    if (value && value !== NO_RESULTS) {
      setFilterValue('');
    }
    setIsOpen(false);
    setFocusedItemIndex(null);
    setSelected(value);
  };

  const selectedComponent = useMemo(() => {
    if (isEmpty(selected)) return toggleProps?.placeholder;

    const selectOption = options?.find((opt) => opt?.value === selected);
    return <InlineFilterSelectOptionContent option={selectOption} />;
  }, [selected, toggleProps?.placeholder, options]);

  const filterOptions = useMemo(
    () =>
      options.filter((option) => option.value.toLowerCase().includes(filterValue.toLowerCase())),
    [options, filterValue],
  );

  const groupedOptions = useMemo(
    () => getGroupedOptions(filterOptions, options),
    [filterOptions, options],
  );

  const toggle = SelectToggle({
    isExpanded: isOpen,
    onClick: onToggle,
    selected: selectedComponent,
    ...toggleProps,
  });

  return (
    <Select
      className={className}
      id="select-inline-filter"
      isOpen={isOpen}
      isScrollable
      onOpenChange={(open: boolean) => setIsOpen(open)}
      onSelect={onSelect}
      popperProps={popperProps}
      selected={selected}
      toggle={toggle}
    >
      <MenuSearch>
        <MenuSearchInput>
          <SearchInput
            onChange={(_, newFilterValue) => {
              if (filterValue !== newFilterValue) {
                setFilterValue(newFilterValue);
              }

              setFocusedItemIndex(null);
            }}
            onClear={(e: SyntheticEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              setFilterValue('');
            }}
            placeholder={toggleProps?.placeholder}
            value={filterValue}
          />
        </MenuSearchInput>
      </MenuSearch>
      <Divider />
      <SelectList id="select-inline-filter-listbox">
        <InlineFilterSelectOptions
          filterOptions={filterOptions}
          filterValue={filterValue}
          focusedItemIndex={focusedItemIndex}
          groupedOptions={groupedOptions}
        />
      </SelectList>
      {menuFooter && menuFooter}
    </Select>
  );
};

export default InlineFilterSelect;
