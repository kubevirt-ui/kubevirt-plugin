import React, { FC, KeyboardEvent, RefObject } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  MenuToggle,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { SearchIcon, TimesIcon } from '@patternfly/react-icons';

type LabelKeyInputProps = {
  activeItemId: null | string;
  inputValue: string;
  isOpen: boolean;
  listboxId: string;
  onClear: () => void;
  onInputChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onToggle: () => void;
  textInputRef: RefObject<HTMLInputElement>;
  toggleRef: React.Ref<HTMLButtonElement>;
};

const LabelKeyInput: FC<LabelKeyInputProps> = ({
  activeItemId,
  inputValue,
  isOpen,
  listboxId,
  onClear,
  onInputChange,
  onKeyDown,
  onToggle,
  textInputRef,
  toggleRef,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <MenuToggle
      isExpanded={isOpen}
      isFullWidth
      onClick={onToggle}
      ref={toggleRef}
      variant="typeahead"
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          aria-activedescendant={activeItemId ?? undefined}
          aria-controls={listboxId}
          autoComplete="off"
          icon={<SearchIcon />}
          innerRef={textInputRef}
          isExpanded={isOpen}
          onChange={(_event, value) => onInputChange(value)}
          onClick={onToggle}
          onKeyDown={onKeyDown}
          placeholder={t('Search or create...')}
          role="combobox"
          value={inputValue}
        />
        {inputValue && (
          <TextInputGroupUtilities>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              aria-label={t('Clear')}
              icon={<TimesIcon />}
              variant={ButtonVariant.plain}
            />
          </TextInputGroupUtilities>
        )}
      </TextInputGroup>
    </MenuToggle>
  );
};

export default LabelKeyInput;
