import React, { FC, useCallback, useMemo, useRef, useState } from 'react';

import { useClickOutside } from '@kubevirt-utils/hooks/useClickOutside/useClickOutside';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuList,
  Popper,
  TextInputGroup,
  TextInputGroupMain,
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

import { SUGGESTED_LABEL_KEYS } from '../constants';

type LabelKeyInputProps = {
  existingKeys: string[];
  onChange: (key: string) => void;
  value: string;
};

const LabelKeyInput: FC<LabelKeyInputProps> = ({ existingKeys, onChange, value }) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const skipNextFocusRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside([containerRef, menuRef], () => setIsOpen(false));

  const filteredSuggestions = useMemo(
    () =>
      SUGGESTED_LABEL_KEYS.filter((key) => !existingKeys.includes(key) || key === value).filter(
        (key) => !value || key.toLowerCase().includes(value.toLowerCase()),
      ),
    [existingKeys, value],
  );

  const onInputChange = useCallback(
    (_event: React.FormEvent<HTMLInputElement>, newValue: string) => {
      onChange(newValue);
      setIsOpen(true);
    },
    [onChange],
  );

  const onInputFocus = useCallback(() => {
    if (skipNextFocusRef.current) {
      skipNextFocusRef.current = false;
      return;
    }
    setIsOpen(true);
  }, []);

  const onSuggestionSelect = useCallback(
    (_event: React.MouseEvent, itemId: string | number) => {
      const key = String(itemId);
      onChange(key);
      setIsOpen(false);
      skipNextFocusRef.current = true;
    },
    [onChange],
  );

  const menu = (
    <Menu isScrollable onSelect={onSuggestionSelect} ref={menuRef}>
      <MenuContent maxMenuHeight="200px">
        <MenuList>
          <MenuItem isDisabled itemId="__info__" key="__info__">
            <InfoCircleIcon /> {t('Type a name to create a new key')}
          </MenuItem>
          <MenuItem isDisabled itemId="__header__" key="__header__">
            <b>{t('Suggested keys')}</b>
          </MenuItem>
          {filteredSuggestions.map((key) => (
            <MenuItem itemId={key} key={key}>
              {key}
            </MenuItem>
          ))}
        </MenuList>
      </MenuContent>
    </Menu>
  );

  return (
    <div ref={containerRef}>
      <Popper
        appendTo={() => document.body}
        isVisible={isOpen && filteredSuggestions.length > 0}
        popper={menu}
        trigger={
          <TextInputGroup>
            <TextInputGroupMain
              aria-label={t('Label key')}
              onChange={onInputChange}
              onFocus={onInputFocus}
              placeholder={t('Search or create')}
              ref={inputRef}
              value={value}
            />
          </TextInputGroup>
        }
      />
    </div>
  );
};

export default LabelKeyInput;
