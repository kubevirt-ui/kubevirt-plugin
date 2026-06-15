import { useState } from 'react';

import { KeyTypes } from '@patternfly/react-core';

const createItemId = (value: string) => `label-key-select-${String(value).replace(/ /g, '-')}`;

type SelectOptionItem = { id: string; isDisabled?: boolean; value: string };

const useSelectNavigation = (allOptions: SelectOptionItem[]) => {
  const [focusedItemIndex, setFocusedItemIndex] = useState<null | number>(null);
  const [activeItemId, setActiveItemId] = useState<null | string>(null);

  const resetFocus = () => {
    setFocusedItemIndex(null);
    setActiveItemId(null);
  };

  const handleArrowKeys = (key: string, isOpen: boolean, setIsOpen: (v: boolean) => void) => {
    if (!isOpen) setIsOpen(true);

    const enabledOptions = allOptions.filter((o) => !o.isDisabled);
    if (enabledOptions.length === 0) return;

    const currentEnabled =
      focusedItemIndex !== null
        ? enabledOptions.findIndex((o) => o.id === allOptions[focusedItemIndex]?.id)
        : -1;

    let newIndex: number;
    if (key === KeyTypes.ArrowDown) {
      newIndex = currentEnabled < enabledOptions.length - 1 ? currentEnabled + 1 : 0;
    } else {
      newIndex = currentEnabled > 0 ? currentEnabled - 1 : enabledOptions.length - 1;
    }

    const targetOption = enabledOptions[newIndex];
    const globalIndex = allOptions.findIndex((o) => o.id === targetOption.id);
    setFocusedItemIndex(globalIndex);
    setActiveItemId(createItemId(targetOption.id));
  };

  const getFocusedOption = () => (focusedItemIndex !== null ? allOptions[focusedItemIndex] : null);

  return { activeItemId, getFocusedOption, handleArrowKeys, resetFocus };
};

export default useSelectNavigation;
