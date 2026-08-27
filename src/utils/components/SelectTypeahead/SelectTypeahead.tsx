import React, { type FC, type Ref } from 'react';

import {
  Button,
  ButtonVariant,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { SearchIcon, TimesIcon } from '@patternfly/react-icons';

import { useSelectTypeahead } from './hooks/useSelectTypeahead';
import { type SelectTypeaheadProps } from './utils/types';
import { createItemId } from './utils/utils';

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
  const {
    activeItemId,
    focusedItemIndex,
    inputValue,
    isOpen,
    listboxId,
    onClearButtonClick,
    onInputKeyDown,
    onOpenChange,
    onSelect,
    onTextInputChange,
    onToggleClick,
    openMenu,
    selectOptions,
    textInputRef,
  } = useSelectTypeahead({
    addOption,
    canCreate,
    getCreateAction,
    options,
    selectedValue,
    setSelectedValue,
  });

  const toggle = (toggleRef: Ref<MenuToggleElement>): React.ReactNode => (
    <MenuToggle
      aria-label="Typeahead menu toggle"
      data-test={dataTestId}
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
          onClick={openMenu}
          onKeyDown={onInputKeyDown}
          placeholder={placeholder}
          value={inputValue}
          {...(activeItemId && { 'aria-activedescendant': activeItemId })}
          aria-controls={listboxId}
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
      data-test={dataTestId}
      id={dataTestId}
      isOpen={isOpen}
      isScrollable
      onOpenChange={onOpenChange}
      onSelect={onSelect}
      selected={selectedValue}
      toggle={toggle}
      variant="typeahead"
    >
      <SelectList id={listboxId}>
        {selectOptions?.map(({ label, optionProps, value }, index) => {
          const { children, key: _key, ...otherOptionProps } = optionProps ?? {};
          return (
            <SelectOption
              key={value}
              {...otherOptionProps}
              id={createItemId(value)}
              isFocused={focusedItemIndex === index}
              value={value}
            >
              {children ?? label ?? value}
            </SelectOption>
          );
        })}
      </SelectList>
    </Select>
  );
};

export type { SelectTypeaheadOptionProps, SelectTypeaheadProps } from './utils/types';
export default SelectTypeahead;
