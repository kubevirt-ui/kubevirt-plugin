import React, { FC, ReactNode, SyntheticEvent, useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  Divider,
  MenuSearch,
  MenuSearchInput,
  MenuToggleProps,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  SelectPopperProps,
} from '@patternfly/react-core';

import SelectToggle from '../toggles/SelectToggle';

import { NO_RESULTS } from './utils/constants';
import { EnhancedSelectOptionProps } from './utils/types';

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
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [filterValue, setFilterValue] = useState<string>('');
  const [focusedItemIndex, setFocusedItemIndex] = useState<null | number>(null);

  const onToggle = () => setIsOpen((prevIsOpen) => !prevIsOpen);

  const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string) => {
    if (value && value !== NO_RESULTS) {
      setSelected(value);
      setFilterValue('');
    }
    setIsOpen(false);
    setFocusedItemIndex(null);
  };

  const getOptionComponent = (opt: EnhancedSelectOptionProps) =>
    !isEmpty(opt?.groupVersionKind) ? (
      <ResourceLink groupVersionKind={opt.groupVersionKind} linkTo={false} name={opt.value} />
    ) : (
      opt?.children
    );

  const selectedComponent = useMemo(() => {
    if (isEmpty(selected)) return toggleProps?.placeholder;

    const selectOption = options?.find((opt) => opt?.value === selected);
    return getOptionComponent(selectOption);
  }, [selected, toggleProps?.placeholder, options]);

  const filterOptions = useMemo(
    () =>
      options.filter((option) => option.value.toLowerCase().includes(filterValue.toLowerCase())),
    [options, filterValue],
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
        {!isEmpty(filterOptions) ? (
          filterOptions.map((option, index) => {
            return (
              <SelectOption
                data-test-id={`select-option-${option.value}`}
                id={`select-inline-filter-${option.value?.replace(' ', '-')}`}
                isFocused={focusedItemIndex === index}
                key={option.value}
                onClick={() => setSelected(option.value)}
                value={option.value}
                {...option}
              >
                {getOptionComponent(option)}
              </SelectOption>
            );
          })
        ) : (
          <SelectOption isDisabled value={NO_RESULTS}>
            {t('No results found for "{{value}}"', {
              value: filterValue,
            })}
          </SelectOption>
        )}
      </SelectList>
      {menuFooter && menuFooter}
    </Select>
  );
};

export default InlineFilterSelect;
