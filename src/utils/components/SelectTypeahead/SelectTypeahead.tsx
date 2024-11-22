import React, { FC, ReactNode, Ref, useRef, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  SelectOptionProps,
} from '@patternfly/react-core';

import Toggle from './Toggle';
import { filterOptions } from './utils';

type SelectTypeaheadProps = {
  id: string;
  newOptionComponent?: (inputValue: string) => ReactNode;
  options: SelectOptionProps[];
  placeholder: string;
  selected: string;
  setSelected: (newSelection: null | string) => void;
};

const SelectTypeahead: FC<SelectTypeaheadProps> = ({
  id,
  newOptionComponent,
  options,
  placeholder,
  selected,
  setSelected,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>(selected || '');
  const [focusedItemIndex, setFocusedItemIndex] = useState<null | number>(null);
  const textInputRef = useRef<HTMLInputElement>();

  const selectOptions = inputValue ? filterOptions(options, inputValue) : options;

  const onSelect = (value: string) => {
    if (value) {
      setInputValue(value);
      setIsOpen(true);
    }

    textInputRef.current?.focus();
  };

  return (
    <Select
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <Toggle
          focusedItemIndex={focusedItemIndex}
          inputValue={inputValue}
          isOpen={isOpen}
          onSelect={onSelect}
          placeholder={placeholder}
          selected={selected}
          selectOptions={selectOptions}
          setFocusedItemIndex={setFocusedItemIndex}
          setInputValue={setInputValue}
          setIsOpen={setIsOpen}
          setSelected={setSelected}
          textInputRef={textInputRef}
          toggleRef={toggleRef}
        />
      )}
      id={id}
      isOpen={isOpen}
      onOpenChange={() => setIsOpen(false)}
      onSelect={(ev, selection) => onSelect(selection as string)}
      selected={selected}
    >
      <SelectList id="select-typeahead-listbox">
        {selectOptions.map((option, index) => (
          <SelectOption
            className={option.className}
            id={`select-typeahead-${option.value.replace(' ', '-')}`}
            isFocused={focusedItemIndex === index}
            key={option.value || option.children}
            {...option}
          >
            {option.children || option.value}
          </SelectOption>
        ))}
      </SelectList>
      {!isEmpty(inputValue) && (
        <SelectOption selected={inputValue === selected} value={inputValue}>
          {newOptionComponent
            ? newOptionComponent(inputValue)
            : t(`Use "{{inputValue}}"`, { inputValue })}
        </SelectOption>
      )}
    </Select>
  );
};

export default SelectTypeahead;
