/* eslint-disable @typescript-eslint/no-shadow */
import React, { FC, useRef, useState } from 'react';
import { TFunction } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import {
  Button,
  ButtonVariant,
  KeyTypes,
  MenuToggle,
  MenuToggleElement,
  MenuToggleProps,
  Select,
  SelectList,
  SelectOption,
  SelectOptionProps,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { SearchIcon, TimesIcon } from '@patternfly/react-icons';

import { CREATE_NEW, INVALID } from './utils/constants';
import { createItemId } from './utils/utils';

export type SelectTypeaheadOptionProps = {
  /** Human readable value.
   * 1. used as option content (may be overridden by optionProps.children)
   * 2. if not present the value prop is used instead.
   * 3. used for filtering the list of available options. If optionProps.children is used then its content should logically match the label prop.
   * 4. should be unique within the list of options (to avoid user confusion)
   */
  label?: string;
  // pass through props
  optionProps?: SelectOptionProps;
  // identity prop used to tract selection - should be unique within the list.
  value: string;
};

type SelectTypeaheadProps = {
  addOption?: (value: string) => void;
  canCreate?: boolean;
  dataTestId?: string;
  getCreateAction?: (value: string, t: TFunction) => SelectOptionProps;
  getToggleStatus?: (value: string) => MenuToggleProps['status'];
  isDisabled?: boolean;
  isFullWidth?: boolean;
  options: SelectTypeaheadOptionProps[];
  placeholder?: string;
  selectedValue: string;
  setSelectedValue: (value: string) => void;
};

const getDisplayValue = (option: SelectTypeaheadOptionProps) =>
  option?.label ?? option?.value ?? '';

const SelectTypeahead: FC<SelectTypeaheadProps> = ({
  addOption,
  canCreate = false,
  dataTestId,
  getCreateAction,
  getToggleStatus,
  isDisabled,
  isFullWidth = false,
  options,
  placeholder,
  selectedValue,
  setSelectedValue,
}) => {
  const [randomIdSuffix] = useState(getRandomChars());
  const createActionId = `${CREATE_NEW}-${randomIdSuffix}`;
  const invalidActionId = `${INVALID}-${randomIdSuffix}`;
  const { t } = useKubevirtTranslation();
  const selected = options.find((option) => option.value === selectedValue);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>(getDisplayValue(selected));

  const [focusedItemIndex, setFocusedItemIndex] = useState<null | number>(null);
  const [activeItemId, setActiveItemId] = useState<null | string>(null);
  const textInputRef = useRef<HTMLInputElement>();

  // extend "empty" search state: show all options if a value is selected
  const showAllOptions = !inputValue || inputValue === getDisplayValue(selected);
  const filteredOptions: SelectTypeaheadOptionProps[] = options?.filter(
    (opt) =>
      showAllOptions || getDisplayValue(opt).toLowerCase().includes(inputValue.toLowerCase()),
  );

  // newly created option has label === value so both need to be unique
  // treat name conflict that same as no input - in most cases: encourage user to type more
  const isNameConflict = options.some(
    (opt) => getDisplayValue(opt) === inputValue || opt.value === inputValue,
  );
  const createOption: SelectTypeaheadOptionProps = canCreate && {
    optionProps: getCreateAction?.(isNameConflict ? '' : inputValue, t),
    value: createActionId,
  };

  const notFoundOption: SelectTypeaheadOptionProps = !canCreate &&
    filteredOptions.length === 0 &&
    inputValue && {
      label: t('No results found for "{{value}}"', { value: inputValue }),
      optionProps: { isDisabled: true },
      value: invalidActionId,
    };

  const notAvailableOption: SelectTypeaheadOptionProps = !canCreate &&
    options.length === 0 &&
    !inputValue && {
      label: t('No options are available'),
      optionProps: { isDisabled: true },
      value: invalidActionId,
    };

  const selectOptions: SelectTypeaheadOptionProps[] = [
    // in the current design extra options are mutually exlusive
    notAvailableOption || notFoundOption || createOption,
    ...filteredOptions,
  ].filter(Boolean);

  const setActiveAndFocusedItem = (itemIndex: number) => {
    setFocusedItemIndex(itemIndex);
    const focusedItem = selectOptions[itemIndex];
    setActiveItemId(createItemId(focusedItem.value));
  };

  const resetActiveAndFocusedItem = () => {
    setFocusedItemIndex(null);
    setActiveItemId(null);
  };

  const openMenu = () => {
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
    resetActiveAndFocusedItem();
  };

  const closeMenuAndSetInputToSelected = () => {
    closeMenu();
    setInputToSelected();
  };

  const setInputToSelected = () => {
    const option = options.find((o) => o.value === selectedValue);
    if (option) {
      setInputValue(getDisplayValue(option));
    }
  };

  const selectOption = (option: SelectTypeaheadOptionProps) => {
    closeMenu();
    setInputValue(getDisplayValue(option));
    setSelectedValue(option.value);
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: number | string | undefined,
  ) => {
    if (!value) return;

    if (value === createActionId) {
      addOption(inputValue);
      selectOption({ value: inputValue });
      return;
    }

    const option = options.find((option) => option.value === value);
    if (option) {
      selectOption(option);
    }
  };

  const onTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);

    if (value) {
      openMenu();
    }

    resetActiveAndFocusedItem();
  };

  const handleMenuArrowKeys = (key: string) => {
    let indexToFocus = 0;

    openMenu();

    if (selectOptions.every((option) => option.optionProps?.isDisabled)) {
      return;
    }

    if (key === KeyTypes.ArrowUp) {
      // When no index is set or at the first index, focus to the last, otherwise decrement focus index
      if (focusedItemIndex === null || focusedItemIndex === 0) {
        indexToFocus = selectOptions.length - 1;
      } else {
        indexToFocus = focusedItemIndex - 1;
      }

      // Skip disabled options
      while (selectOptions[indexToFocus]?.optionProps?.isDisabled) {
        indexToFocus--;
        if (indexToFocus === -1) {
          indexToFocus = selectOptions.length - 1;
        }
      }
    }

    if (key === KeyTypes.ArrowDown) {
      // When no index is set or at the last index, focus to the first, otherwise increment focus index
      if (focusedItemIndex === null || focusedItemIndex === selectOptions.length - 1) {
        indexToFocus = 0;
      } else {
        indexToFocus = focusedItemIndex + 1;
      }

      // Skip disabled options
      while (selectOptions[indexToFocus]?.optionProps?.isDisabled) {
        indexToFocus++;
        if (indexToFocus === selectOptions.length) {
          indexToFocus = 0;
        }
      }
    }

    setActiveAndFocusedItem(indexToFocus);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const focusedItem = focusedItemIndex !== null ? selectOptions[focusedItemIndex] : null;

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (isOpen && focusedItem && !focusedItem.optionProps?.isAriaDisabled) {
          onSelect(undefined, focusedItem.value);
        }

        openMenu();

        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        handleMenuArrowKeys(event.key);
        break;
    }
  };

  const onToggleClick = () => {
    setIsOpen((isOpen) => !isOpen);
    textInputRef?.current?.focus();
  };

  const onTextInputClick = openMenu;

  const onClearButtonClick = () => {
    setSelectedValue(undefined);
    setInputValue('');
    resetActiveAndFocusedItem();
    textInputRef?.current?.focus();
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      aria-label="Typeahead menu toggle"
      isDisabled={isDisabled}
      isExpanded={isOpen}
      isFullWidth={isFullWidth}
      onClick={onToggleClick}
      ref={toggleRef}
      status={getToggleStatus?.(inputValue)}
      variant="typeahead"
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          autoComplete="off"
          icon={<SearchIcon />}
          innerRef={textInputRef}
          onChange={onTextInputChange}
          onClick={onTextInputClick}
          onKeyDown={onInputKeyDown}
          placeholder={placeholder}
          value={inputValue}
          {...(activeItemId && { 'aria-activedescendant': activeItemId })}
          aria-controls={`select-typeahead-listbox-${randomIdSuffix}`}
          isExpanded={isOpen}
          role="combobox"
        />

        {!!inputValue && (
          <TextInputGroupUtilities>
            <Button
              aria-label="Clear input value"
              icon={<TimesIcon />}
              onClick={onClearButtonClick}
              variant={ButtonVariant.plain}
            />
          </TextInputGroupUtilities>
        )}
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <Select
      onOpenChange={(isOpen) => {
        !isOpen && closeMenuAndSetInputToSelected();
      }}
      data-test={dataTestId}
      id={dataTestId}
      isOpen={isOpen}
      isScrollable
      onSelect={onSelect}
      selected={selectedValue}
      toggle={toggle}
      variant="typeahead"
    >
      <SelectList id={`select-typeahead-listbox-${randomIdSuffix}`}>
        {selectOptions?.map(
          ({ label, optionProps: { children, ...otherOptionProps }, value }, index) => (
            <SelectOption
              {...otherOptionProps}
              id={createItemId(value)}
              isFocused={focusedItemIndex === index}
              key={value}
              value={value}
            >
              {children ?? label ?? value}
            </SelectOption>
          ),
        )}
      </SelectList>
    </Select>
  );
};

export default SelectTypeahead;
