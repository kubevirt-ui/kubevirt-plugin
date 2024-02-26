import React, {
  Dispatch,
  FormEvent,
  Ref,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';

import { ESCAPE, TAB } from '@kubevirt-utils/hooks/useClickOutside/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Button,
  MenuToggle,
  MenuToggleElement,
  MenuToggleProps,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';

import { ARROW_DOWN, ARROW_UP, ENTER, NO_RESULTS } from '../utils/constants';
import { EnhancedSelectOptionProps } from '../utils/types';

type UseTypeaheadSelectParams = {
  options: EnhancedSelectOptionProps[];
  selected: string;
  setSelected: (selected: string) => void;
  toggleProps?: MenuToggleProps;
};

type UseTypeaheadSelectValues = {
  focusedItemIndex: number;
  isOpen: boolean;
  onSelect: (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string) => void;
  selectOptions: EnhancedSelectOptionProps[];
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  toggle: (toggleRef: Ref<MenuToggleElement>) => JSX.Element;
};

const useTypeaheadSelect = ({
  options,
  selected,
  setSelected,
  toggleProps,
}: UseTypeaheadSelectParams): UseTypeaheadSelectValues => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(selected);
  const [filterValue, setFilterValue] = useState<string>(selected);
  const [selectOptions, setSelectOptions] = useState<EnhancedSelectOptionProps[]>(options);
  const [focusedItemIndex, setFocusedItemIndex] = useState<null | number>(null);
  const [activeItem, setActiveItem] = useState<null | string>(null);
  const textInputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    let newSelectOptions: EnhancedSelectOptionProps[] = [...options];
    if (!isEmpty(filterValue)) {
      newSelectOptions = options.filter((option) =>
        option.value.toLowerCase().includes(filterValue.toLowerCase()),
      );

      if (isEmpty(newSelectOptions)) {
        newSelectOptions = [
          {
            children: t('No results found for "{{value}}"', {
              value: filterValue,
            }),
            isDisabled: true,
            value: NO_RESULTS,
          },
        ];
      }
    }

    setSelectOptions(newSelectOptions);
    setActiveItem(null);
    setFocusedItemIndex(null);
  }, [filterValue, isOpen, options, t]);

  const onToggle = () => setIsOpen((prevIsOpen) => !prevIsOpen);

  const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string) => {
    if (value && value !== NO_RESULTS) {
      setInputValue(value);
      setFilterValue('');
      setSelected(value);
    }
    setIsOpen(false);
    setFocusedItemIndex(null);
    setActiveItem(null);
  };

  const onTextInputChange = (_event: FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
    setFilterValue(value);
  };

  const handleMenuArrowKeys = (key: string) => {
    let indexToFocus;

    if (isOpen) {
      if (key === ARROW_UP) {
        // When no index is set or at the first index, focus to the last, otherwise decrement focus index
        if (focusedItemIndex === null || focusedItemIndex === 0) {
          indexToFocus = selectOptions.length - 1;
        } else {
          indexToFocus = focusedItemIndex - 1;
        }
      }

      if (key === ARROW_DOWN) {
        // When no index is set or at the last index, focus to the first, otherwise increment focus index
        if (focusedItemIndex === null || focusedItemIndex === selectOptions.length - 1) {
          indexToFocus = 0;
        } else {
          indexToFocus = focusedItemIndex + 1;
        }
      }

      setFocusedItemIndex(indexToFocus);
      const focusedItem = selectOptions.filter((option) => !option.isDisabled)[indexToFocus];
      setActiveItem(`select-typeahead-${focusedItem.value.replace(' ', '-')}`);
    }
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const enabledMenuItems = selectOptions.filter((option) => !option.isDisabled);
    const [firstMenuItem] = enabledMenuItems;
    const focusedItem = focusedItemIndex ? enabledMenuItems[focusedItemIndex] : firstMenuItem;

    switch (event.key) {
      // Select the first available option
      case ENTER:
        if (isOpen && focusedItem.value !== NO_RESULTS) {
          setInputValue(String(focusedItem.children));
          setFilterValue('');
          setSelected(String(focusedItem.children));
        }

        setIsOpen((prevIsOpen) => !prevIsOpen);
        setFocusedItemIndex(null);
        setActiveItem(null);

        break;
      case TAB:
      case ESCAPE:
        setIsOpen(false);
        setActiveItem(null);
        break;
      case ARROW_UP:
      case ARROW_DOWN:
        event.preventDefault();
        handleMenuArrowKeys(event.key);
        break;
    }
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      isExpanded={isOpen}
      onClick={onToggle}
      ref={toggleRef}
      variant="typeahead"
      {...toggleProps}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          autoComplete="off"
          id="select-typeahead-input"
          innerRef={textInputRef}
          onChange={onTextInputChange}
          onClick={onToggle}
          onKeyDown={onInputKeyDown}
          placeholder={toggleProps?.placeholder}
          value={inputValue}
          {...(activeItem && { 'aria-activedescendant': activeItem })}
          aria-controls="select-typeahead-listbox"
          isExpanded={isOpen}
          role="combobox"
        />

        <TextInputGroupUtilities>
          {!!inputValue && (
            <Button
              onClick={() => {
                setSelected('');
                setInputValue('');
                setFilterValue('');
                textInputRef?.current?.focus();
              }}
              aria-label="Clear input value"
              variant="plain"
            >
              <TimesIcon aria-hidden />
            </Button>
          )}
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  return {
    focusedItemIndex,
    isOpen,
    onSelect,
    selectOptions,
    setIsOpen,
    toggle,
  };
};

export default useTypeaheadSelect;
