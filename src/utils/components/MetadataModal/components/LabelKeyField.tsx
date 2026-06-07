import React, { FC, FormEvent, MouseEvent, useMemo, useRef, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getRandomChars, isEmpty } from '@kubevirt-utils/utils/utils';
import { Select } from '@patternfly/react-core';

import { CREATE_VALUE, HINT_VALUE } from '../utils/constants';
import { SelectOptionItem } from '../utils/types';
import { getGroupedOptions, isValidKeyOnClose, isValidNewLabelKey } from '../utils/utils';

import LabelKeyDropdown from './LabelKeyDropdown';
import LabelKeyInput from './LabelKeyInput';
import useLabelKeyNavigation from './useLabelKeyNavigation';

import './label-key-select.scss';

type LabelKeyFieldProps = {
  existingKeys: string[];
  onSelect: (key: string) => void;
  selectedKey: string;
};

const LabelKeyField: FC<LabelKeyFieldProps> = ({ existingKeys, onSelect, selectedKey }) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const textInputRef = useRef<HTMLInputElement>(null);
  const listboxIdRef = useRef(`label-key-listbox-${getRandomChars()}`);

  const groups = useMemo(
    () => getGroupedOptions(existingKeys, inputValue, t),
    [existingKeys, inputValue, t],
  );

  const canCreateNewKey = useMemo(
    () => isValidNewLabelKey(inputValue, selectedKey, existingKeys),
    [existingKeys, inputValue, selectedKey],
  );

  const enabledOptions = useMemo(() => {
    const opts = groups.flatMap(({ options }) =>
      options.map((key): SelectOptionItem => ({ id: key, value: key })),
    );
    if (canCreateNewKey) opts.unshift({ id: CREATE_VALUE, value: CREATE_VALUE });
    return opts;
  }, [canCreateNewKey, groups]);

  const commitSelection = (selected: string) => {
    onSelect(selected);
    setInputValue('');
    setIsOpen(false);
    resetFocus();
  };

  const { activeItemId, handleInputKeyDown, resetFocus } = useLabelKeyNavigation({
    canCreateNew: canCreateNewKey,
    commitSelection,
    displayValue: inputValue,
    enabledOptions,
    isOpen,
    setIsOpen,
  });

  const handleDropdownToggle = () => {
    setIsOpen((prev) => !prev);
    textInputRef.current?.focus();
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value) setIsOpen(true);
    resetFocus();
  };

  const handleClear = () => {
    onSelect('');
    setInputValue('');
    resetFocus();
    textInputRef.current?.focus();
  };

  const handleDropdownClose = () => {
    setIsOpen(false);
    resetFocus();
    if (isValidKeyOnClose(inputValue, selectedKey)) {
      onSelect(inputValue);
    }
    setInputValue('');
  };

  return (
    <div data-test="label-key-select">
      <Select
        onSelect={(_e: FormEvent | MouseEvent, value: string) => {
          if (value !== HINT_VALUE) {
            commitSelection(value === CREATE_VALUE ? inputValue : value);
          }
        }}
        toggle={(toggleRef) => (
          <LabelKeyInput
            activeItemId={activeItemId}
            inputValue={inputValue || selectedKey}
            isOpen={isOpen}
            listboxId={listboxIdRef.current}
            onClear={handleClear}
            onInputChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onToggle={handleDropdownToggle}
            textInputRef={textInputRef}
            toggleRef={toggleRef}
          />
        )}
        isOpen={isOpen}
        isScrollable
        onOpenChange={(open) => !open && handleDropdownClose()}
        selected={selectedKey}
        variant="typeahead"
      >
        <LabelKeyDropdown
          activeItemId={activeItemId}
          canCreateNew={canCreateNewKey}
          groups={groups}
          hasResults={!isEmpty(enabledOptions)}
          inputValue={inputValue}
          listboxId={listboxIdRef.current}
        />
      </Select>
    </div>
  );
};

export default LabelKeyField;
