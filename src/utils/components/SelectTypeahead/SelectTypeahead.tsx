import React, { Dispatch, FC, ReactNode, SetStateAction, useEffect, useRef, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Button,
  ButtonVariant,
  HelperText,
  HelperTextItem,
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

import { CREATE_NEW, INVALID, NOT_FOUND } from './utils/constants';
import { createItemId } from './utils/utils';

type SelectTypeaheadProps = {
  canCreate?: boolean;
  createNewOption?: (filterValue: string) => SelectOptionProps;
  dataTestId?: string;
  getCreateOption?: (inputValue: string, canCreate?: boolean) => SelectOptionProps;
  getCreationNotAllowedMessage?: (filterValue: string) => ReactNode;
  getToggleStatus?: (filterValue: string) => MenuToggleProps['status'];
  initialOptions: SelectOptionProps[];
  isFullWidth?: boolean;
  placeholder?: string;
  selected: string;
  setInitialOptions?: Dispatch<SetStateAction<SelectOptionProps[]>>;
  setSelected: (newFolder: string) => void;
};

const SelectTypeahead: FC<SelectTypeaheadProps> = ({
  canCreate = false,
  createNewOption,
  dataTestId,
  getCreateOption,
  getCreationNotAllowedMessage,
  getToggleStatus,
  initialOptions,
  isFullWidth = false,
  placeholder,
  selected,
  setInitialOptions,
  setSelected,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>(selected);
  const [filterValue, setFilterValue] = useState<string>('');
  const [selectOptions, setSelectOptions] = useState<SelectOptionProps[]>();
  const [focusedItemIndex, setFocusedItemIndex] = useState<null | number>(null);
  const [activeItemId, setActiveItemId] = useState<null | string>(null);
  const textInputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    const filteredOptions: SelectOptionProps[] = filterValue
      ? (initialOptions || [])?.filter((menuItem) =>
          String(menuItem.value).toLowerCase().includes(filterValue.toLowerCase()),
        )
      : initialOptions || [];

    if (canCreate) {
      const creationNotAllowedMessage = getCreationNotAllowedMessage?.(filterValue);

      if (creationNotAllowedMessage && filteredOptions.length === 0) {
        setSelectOptions([
          {
            children: (
              <HelperText>
                <HelperTextItem variant="error">{creationNotAllowedMessage}</HelperTextItem>
              </HelperText>
            ),
            isDisabled: true,
            value: INVALID,
          },
        ]);
        return;
      }

      if (!creationNotAllowedMessage) {
        const createOption = getCreateOption?.(filterValue, canCreate);
        const optionExists = filteredOptions.some((option) => option.value === filterValue);

        if (createOption && !optionExists) {
          setSelectOptions([createOption, ...filteredOptions]);
          return;
        }
      }
    }

    if (!canCreate && filteredOptions.length === 0 && filterValue) {
      setSelectOptions([{ children: t('Not found'), isDisabled: true, value: NOT_FOUND }]);
      return;
    }

    setSelectOptions(filteredOptions);
  }, [canCreate, filterValue, getCreateOption, getCreationNotAllowedMessage, initialOptions, t]);

  const setActiveAndFocusedItem = (itemIndex: number) => {
    setFocusedItemIndex(itemIndex);
    const focusedItem = selectOptions[itemIndex];
    setActiveItemId(createItemId(focusedItem.value));
  };

  const resetActiveAndFocusedItem = () => {
    setFocusedItemIndex(null);
    setActiveItemId(null);
  };

  const closeMenu = () => {
    setIsOpen(false);
    resetActiveAndFocusedItem();
  };

  const selectOption = (value: number | string, content: number | string) => {
    setInputValue(String(content));
    setFilterValue('');
    setSelected(String(value));

    closeMenu();
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: number | string | undefined,
  ) => {
    if (!value) return;

    if (value === CREATE_NEW) {
      if (!initialOptions?.some((item) => item.value === filterValue)) {
        setInitialOptions?.((prevOptions) => [
          ...(prevOptions || []),
          createNewOption(filterValue),
        ]);
      }
      setSelected(filterValue);
      setFilterValue('');
      closeMenu();
      return;
    }

    const optionChildren = selectOptions.find((option) => option.value === value)?.children;

    if (typeof optionChildren === 'object') return selectOption(value, value);

    selectOption(value, optionChildren as string);
  };

  const onTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
    setFilterValue(value);

    if (!isEmpty(value) && !isOpen) setIsOpen(true);

    resetActiveAndFocusedItem();

    if (value !== selected) {
      setSelected('');
    }
  };

  const handleMenuArrowKeys = (key: string) => {
    let indexToFocus = 0;

    if (!isOpen) {
      setIsOpen(true);
    }

    if (selectOptions.every((option) => option.isDisabled)) {
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
      while (selectOptions[indexToFocus].isDisabled) {
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
      while (selectOptions[indexToFocus].isDisabled) {
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
        if (isOpen && focusedItem && !focusedItem.isAriaDisabled) {
          onSelect(undefined, focusedItem.value as string);
        }

        if (!isOpen) {
          setIsOpen(true);
        }

        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        handleMenuArrowKeys(event.key);
        break;
    }
  };

  const onToggleClick = () => {
    setIsOpen((open) => !open);
    textInputRef?.current?.focus();
  };

  const onTextInputClick = () => {
    setIsOpen(true);
  };

  const onClearButtonClick = () => {
    setSelected('');
    setInputValue('');
    setFilterValue('');
    resetActiveAndFocusedItem();
    textInputRef?.current?.focus();
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      isExpanded={isOpen}
      isFullWidth={isFullWidth}
      onClick={onToggleClick}
      ref={toggleRef}
      status={getToggleStatus?.(filterValue)}
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
          isExpanded={isOpen}
          role="combobox"
        />

        {!isEmpty(inputValue) && (
          <TextInputGroupUtilities>
            <Button
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
      onOpenChange={(open) => {
        !open && closeMenu();
      }}
      data-test={dataTestId}
      id={dataTestId}
      isOpen={isOpen}
      isScrollable
      onSelect={onSelect}
      selected={selected}
      toggle={toggle}
      variant="typeahead"
    >
      <SelectList>
        {selectOptions?.map((option, index) => (
          <SelectOption
            className={option.className}
            id={createItemId(option.value)}
            isFocused={focusedItemIndex === index}
            key={option.value || option.children}
            {...option}
          />
        ))}
      </SelectList>
    </Select>
  );
};

export default SelectTypeahead;
