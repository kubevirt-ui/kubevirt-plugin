import { useEffect, useMemo } from 'react';

import { type DropdownConfig, type DropdownOption } from './types';

type UseDropdownOptionsParams<T> = {
  config: DropdownConfig;
  disabledItemTooltip?: string;
  extractKey: (item: T) => string;
  extractTitle: (item: T) => string;
  includeAllItems: boolean;
  isItemDisabled?: (key: string) => boolean;
  items: null | T[] | undefined;
  itemsLoaded: boolean;
  omittedItems?: string[];
  onChange: (item: string) => void;
  selectedItem: string;
};

export const useDropdownOptions = <T>({
  config,
  disabledItemTooltip,
  extractKey,
  extractTitle,
  includeAllItems,
  isItemDisabled,
  items,
  itemsLoaded,
  omittedItems,
  onChange,
  selectedItem,
}: UseDropdownOptionsParams<T>): DropdownOption[] => {
  const { allItemsKey, allItemsTitle } = config;

  const optionItems = useMemo(() => {
    if (!items || !itemsLoaded) return [];

    const omittedSet = omittedItems ? new Set(omittedItems) : new Set();
    const filteredItems = items.filter((item) => {
      const key = extractKey(item);
      return !omittedSet.has(key);
    });

    const mappedItems: DropdownOption[] = filteredItems.map((item) => {
      const key = extractKey(item);
      const isDisabled = isItemDisabled?.(key) ?? false;
      return {
        disabled: isDisabled,
        key,
        title: extractTitle(item),
        tooltip: isDisabled && disabledItemTooltip ? disabledItemTooltip : undefined,
      };
    });

    mappedItems.sort((a, b) => a.title.localeCompare(b.title));

    if (includeAllItems) {
      const allItemsDisabled = isItemDisabled?.(allItemsKey) ?? false;
      mappedItems.unshift({
        disabled: allItemsDisabled,
        key: allItemsKey,
        title: allItemsTitle,
        tooltip: allItemsDisabled && disabledItemTooltip ? disabledItemTooltip : undefined,
      });
    }

    return mappedItems;
  }, [
    items,
    itemsLoaded,
    includeAllItems,
    allItemsTitle,
    allItemsKey,
    disabledItemTooltip,
    extractKey,
    extractTitle,
    isItemDisabled,
    omittedItems,
  ]);

  useEffect(() => {
    if (!itemsLoaded || !optionItems.length) return;

    if (selectedItem && !optionItems.some((item) => item.key === selectedItem)) {
      const firstEnabledItem =
        optionItems.find((item) => !item.disabled)?.key ?? optionItems[0]?.key;
      if (firstEnabledItem) {
        onChange(firstEnabledItem);
      }
    }
  }, [itemsLoaded, optionItems, selectedItem, onChange]);

  return optionItems;
};
