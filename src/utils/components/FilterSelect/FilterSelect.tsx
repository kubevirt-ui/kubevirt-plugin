import React, { FC } from 'react';
import classnames from 'classnames';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  MenuToggleProps,
  Select,
  SelectList,
  SelectOption,
  SelectPopperProps,
} from '@patternfly/react-core';

import useTypeaheadSelect from './hooks/useTypeaheadSelect';
import { EnhancedSelectOptionProps } from './utils/types';

import './FilterSelect.scss';

type FilterSelectProps = {
  className?: string;
  optionLabelText?: string;
  options: EnhancedSelectOptionProps[];
  popperProps?: SelectPopperProps;
  selected: string;
  setSelected: (val: string) => void;
  toggleProps?: MenuToggleProps;
};

const FilterSelect: FC<FilterSelectProps> = ({
  className,
  options = [],
  popperProps,
  selected,
  setSelected,
  toggleProps,
}) => {
  const { focusedItemIndex, isOpen, onSelect, selectOptions, setIsOpen, toggle } =
    useTypeaheadSelect({ options, selected, setSelected, toggleProps });

  return (
    <Select
      className={classnames('FilterSelect', className)}
      id="select-typeahead"
      isOpen={isOpen}
      onOpenChange={(open: boolean) => setIsOpen(open)}
      onSelect={onSelect}
      popperProps={popperProps}
      selected={selected}
      toggle={toggle}
    >
      <SelectList id="select-typeahead-listbox">
        {selectOptions.map((option, index) => {
          return (
            <SelectOption
              data-test-id={`select-option-${option.value}`}
              id={`select-typeahead-${option.value?.replace(' ', '-')}`}
              isFocused={focusedItemIndex === index}
              key={option.value}
              onClick={() => setSelected(option.value)}
              value={option.value}
              {...option}
            >
              {!isEmpty(option.groupVersionKind) ? (
                <ResourceLink
                  groupVersionKind={option.groupVersionKind}
                  linkTo={false}
                  name={option.value}
                />
              ) : (
                option.children
              )}
            </SelectOption>
          );
        })}
      </SelectList>
    </Select>
  );
};

export default FilterSelect;
