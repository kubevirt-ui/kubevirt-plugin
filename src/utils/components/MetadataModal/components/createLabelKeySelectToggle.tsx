import React, { Ref } from 'react';

import {
  Button,
  ButtonVariant,
  MenuToggle,
  MenuToggleElement,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { SearchIcon, TimesIcon } from '@patternfly/react-icons';

type LabelKeySelectToggleParams = {
  activeItemId: null | string;
  ariaLabel: string;
  clearLabel: string;
  inputValue: string;
  isOpen: boolean;
  listboxId: string;
  onClear: () => void;
  onInputChange: (event: React.FormEvent<HTMLInputElement>, value: string) => void;
  onInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  textInputRef: React.RefObject<HTMLInputElement>;
};

const createLabelKeySelectToggle =
  ({
    activeItemId,
    ariaLabel,
    clearLabel,
    inputValue,
    isOpen,
    listboxId,
    onClear,
    onInputChange,
    onInputKeyDown,
    placeholder,
    setIsOpen,
    textInputRef,
  }: LabelKeySelectToggleParams) =>
  (toggleRef: Ref<MenuToggleElement>) =>
    (
      <MenuToggle
        onClick={() => {
          setIsOpen((prev) => !prev);
          textInputRef.current?.focus();
        }}
        aria-label={ariaLabel}
        isExpanded={isOpen}
        isFullWidth
        ref={toggleRef}
        variant="typeahead"
      >
        <TextInputGroup isPlain>
          <TextInputGroupMain
            {...(activeItemId && { 'aria-activedescendant': activeItemId })}
            aria-controls={listboxId}
            autoComplete="off"
            icon={<SearchIcon />}
            innerRef={textInputRef}
            isExpanded={isOpen}
            onChange={onInputChange}
            onClick={() => setIsOpen(true)}
            onKeyDown={onInputKeyDown}
            placeholder={placeholder}
            role="combobox"
            value={inputValue}
          />
          {inputValue && (
            <TextInputGroupUtilities>
              <Button
                aria-label={clearLabel}
                icon={<TimesIcon />}
                onClick={onClear}
                variant={ButtonVariant.plain}
              />
            </TextInputGroupUtilities>
          )}
        </TextInputGroup>
      </MenuToggle>
    );

export default createLabelKeySelectToggle;
