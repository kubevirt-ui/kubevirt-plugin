import React, {
  Dispatch,
  FC,
  FormEvent,
  KeyboardEvent,
  Ref,
  RefObject,
  SetStateAction,
} from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Button,
  ButtonVariant,
  MenuToggle,
  MenuToggleElement,
  SelectOptionProps,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';

import { handleMenuArrowKeys } from './utils';

type ToggleProps = {
  focusedItemIndex: null | number;
  inputValue: string;
  isOpen: boolean;
  onSelect: (value: string) => void;
  placeholder: string;
  selected: string;
  selectOptions: SelectOptionProps[];
  setFocusedItemIndex: (newValue: null | number) => void;
  setInputValue: (newInput: string) => void;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setSelected: (newSelection: string) => void;
  textInputRef: RefObject<any>;
  toggleRef: Ref<MenuToggleElement>;
};

const Toggle: FC<ToggleProps> = ({
  focusedItemIndex,
  inputValue,
  isOpen,
  onSelect,
  placeholder,
  selected,
  selectOptions,
  setFocusedItemIndex,
  setInputValue,
  setIsOpen,
  setSelected,
  textInputRef,
  toggleRef,
}) => {
  const { t } = useKubevirtTranslation();

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const enabledMenuItems = selectOptions.filter((menuItem) => !menuItem.isDisabled);
    const [firstMenuItem] = enabledMenuItems;
    const focusedItem = focusedItemIndex ? enabledMenuItems?.[focusedItemIndex] : firstMenuItem;

    switch (event.key) {
      // Select the first available option
      case 'Enter':
        isOpen ? onSelect(focusedItem.value as string) : setIsOpen((prevIsOpen) => !prevIsOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();

        if (isOpen) {
          const indexToFocus = handleMenuArrowKeys(event.key, focusedItemIndex, selectOptions);

          setFocusedItemIndex(indexToFocus);
        }

        if (!isOpen) setIsOpen(true);
        break;
    }
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onTextInputChange = (_event: FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
    setFocusedItemIndex(null);

    if (value) setIsOpen(true);
  };

  return (
    <MenuToggle
      innerRef={toggleRef}
      isExpanded={isOpen}
      isFullWidth
      onClick={onToggleClick}
      variant="typeahead"
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          aria-controls="select-typeahead-listbox"
          autoComplete="off"
          id="typeahead-select-input"
          innerRef={textInputRef}
          isExpanded={isOpen}
          onChange={onTextInputChange}
          onClick={onToggleClick}
          onKeyDown={onInputKeyDown}
          placeholder={isEmpty(selected) ? placeholder : null}
          role="combobox"
          value={inputValue || selected}
        />
        <TextInputGroupUtilities>
          {!isEmpty(selected) && (
            <Button
              onClick={() => {
                setInputValue('');
                setSelected(null);
                textInputRef?.current?.focus();
              }}
              aria-label={t('Clear input value')}
              variant={ButtonVariant.plain}
            >
              <TimesIcon aria-hidden />
            </Button>
          )}
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );
};

export default Toggle;
