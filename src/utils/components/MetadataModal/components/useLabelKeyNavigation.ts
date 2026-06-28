import { KeyboardEvent, useState } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { KeyTypes } from '@patternfly/react-core';

import { CREATE_VALUE } from '../utils/constants';
import { SelectOptionItem } from '../utils/types';
import { createLabelKeyId } from '../utils/utils';

type UseLabelKeyNavigationProps = {
  canCreateNew: boolean;
  commitSelection: (selected: string) => void;
  displayValue: string;
  enabledOptions: SelectOptionItem[];
  isOpen: boolean;
  setIsOpen: (updater: ((prev: boolean) => boolean) | boolean) => void;
};

const useLabelKeyNavigation = ({
  canCreateNew,
  commitSelection,
  displayValue,
  enabledOptions,
  isOpen,
  setIsOpen,
}: UseLabelKeyNavigationProps) => {
  const [focusedIndex, setFocusedIndex] = useState<null | number>(null);

  const resetFocus = () => setFocusedIndex(null);

  const activeItemId =
    focusedIndex !== null ? createLabelKeyId(enabledOptions[focusedIndex]?.id) : null;

  const handleArrowKeys = (key: string) => {
    if (!isOpen) {
      setIsOpen(true);
      return;
    }
    if (isEmpty(enabledOptions)) return;
    const lastIndex = enabledOptions.length - 1;
    const atEnd = focusedIndex === null || focusedIndex >= lastIndex;
    const atStart = focusedIndex === null || focusedIndex <= 0;
    if (key === KeyTypes.ArrowDown) {
      setFocusedIndex(atEnd ? 0 : focusedIndex + 1);
    } else {
      setFocusedIndex(atStart ? lastIndex : focusedIndex - 1);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const { key } = event;
    const isArrowKey = key === KeyTypes.ArrowUp || key === KeyTypes.ArrowDown;

    if (key !== KeyTypes.Enter && !isArrowKey) return;
    event.preventDefault();

    if (isArrowKey) {
      handleArrowKeys(key);
      return;
    }

    const focused = focusedIndex !== null ? enabledOptions[focusedIndex] : null;
    const resolvedValue = focused?.value === CREATE_VALUE ? displayValue : focused?.value;

    if (isOpen && focused && resolvedValue) return commitSelection(resolvedValue);
    if (canCreateNew) return commitSelection(displayValue);
  };

  return { activeItemId, handleInputKeyDown, resetFocus };
};

export default useLabelKeyNavigation;
