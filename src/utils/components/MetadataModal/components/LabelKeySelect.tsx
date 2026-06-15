import React, { FC, FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { KeyTypes, Select, SelectList } from '@patternfly/react-core';

import { CURATED_LABEL_KEYS } from '../utils/constants';
import { getGroupedOptions, isLabelKeyValid, isSystemLabelKey } from '../utils/utils';

import createLabelKeySelectToggle from './createLabelKeySelectToggle';
import LabelKeySelectOptions from './LabelKeySelectOptions';
import useSelectNavigation from './useSelectNavigation';

import './label-key-select.scss';

type LabelKeySelectProps = {
  existingKeys: string[];
  onSelect: (key: string) => void;
  selectedKey: string;
};

const LabelKeySelect: FC<LabelKeySelectProps> = ({ existingKeys, onSelect, selectedKey }) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(selectedKey || '');
  const textInputRef = useRef<HTMLInputElement>(null);
  const [listboxId] = useState(`label-key-listbox-${getRandomChars()}`);

  useEffect(() => setInputValue(selectedKey || ''), [selectedKey]);

  const groups = useMemo(
    () => getGroupedOptions(existingKeys, inputValue === selectedKey ? '' : inputValue, t),
    [existingKeys, inputValue, selectedKey, t],
  );

  const canCreateNew =
    inputValue &&
    inputValue !== selectedKey &&
    !existingKeys.includes(inputValue) &&
    !CURATED_LABEL_KEYS.includes(inputValue) &&
    !isSystemLabelKey(inputValue) &&
    isLabelKeyValid(inputValue);

  const allOptions = useMemo(() => {
    const opts: { id: string; isDisabled?: boolean; value: string }[] = [
      { id: '__hint__', isDisabled: true, value: '__hint__' },
    ];
    if (canCreateNew) opts.push({ id: '__create__', value: '__create__' });
    groups.forEach(({ options }) => options.forEach((key) => opts.push({ id: key, value: key })));
    return opts;
  }, [canCreateNew, groups]);

  const hasResults = groups.some(({ options }) => options.length > 0) || canCreateNew;
  const { activeItemId, getFocusedOption, handleArrowKeys, resetFocus } =
    useSelectNavigation(allOptions);

  const commitSelection = (value: string) => {
    const selected = value === '__create__' ? inputValue : value;
    onSelect(selected);
    setInputValue(selected);
    setIsOpen(false);
    resetFocus();
  };

  const handleSelect = (_event: React.ChangeEvent | React.MouseEvent, value: string) => {
    if (value === '__hint__') return;
    commitSelection(value);
  };

  const onInputChange = (_event: FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
    if (value) setIsOpen(true);
    resetFocus();
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === KeyTypes.Enter) {
      event.preventDefault();
      const focused = getFocusedOption();
      if (isOpen && focused && !focused.isDisabled) commitSelection(focused.value);
      else if (canCreateNew) commitSelection('__create__');
    } else if (event.key === KeyTypes.ArrowUp || event.key === KeyTypes.ArrowDown) {
      event.preventDefault();
      handleArrowKeys(event.key, isOpen, setIsOpen);
    }
  };

  const onClear = () => {
    onSelect('');
    setInputValue('');
    resetFocus();
    textInputRef.current?.focus();
  };

  return (
    <div data-test="label-key-select">
      <Select
        onOpenChange={(open) => {
          if (!open) {
            setIsOpen(false);
            resetFocus();
            if (
              inputValue &&
              inputValue !== selectedKey &&
              !isSystemLabelKey(inputValue) &&
              isLabelKeyValid(inputValue)
            ) {
              onSelect(inputValue);
            } else if (!inputValue || inputValue !== selectedKey) {
              setInputValue(selectedKey || '');
            }
          }
        }}
        toggle={createLabelKeySelectToggle({
          activeItemId,
          ariaLabel: t('Label key'),
          clearLabel: t('Clear'),
          inputValue,
          isOpen,
          listboxId,
          onClear,
          onInputChange,
          onInputKeyDown,
          placeholder: t('Search or create...'),
          setIsOpen,
          textInputRef,
        })}
        isOpen={isOpen}
        isScrollable
        onSelect={handleSelect}
        selected={selectedKey}
        variant="typeahead"
      >
        <SelectList id={listboxId}>
          <LabelKeySelectOptions
            activeItemId={activeItemId}
            canCreateNew={Boolean(canCreateNew)}
            groups={groups}
            hasResults={Boolean(hasResults)}
            inputValue={inputValue}
          />
        </SelectList>
      </Select>
    </div>
  );
};

export default LabelKeySelect;
