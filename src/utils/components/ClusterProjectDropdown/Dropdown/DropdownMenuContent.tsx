import type { ReactElement } from 'react';

import DropdownMenuFilteredGroups from './DropdownMenuFilteredGroups';
import type { DropdownMenuContentProps } from './types';
import { useDropdownOptions } from './useDropdownOptions';

function DropdownMenuContent<T>({
  dropdownProps,
  filterText,
}: Readonly<DropdownMenuContentProps<T>>): ReactElement {
  const {
    config,
    disabledItemTooltip,
    extractKey,
    extractTitle,
    includeAllItems = true,
    isItemDisabled,
    items,
    itemsLoaded,
    omittedItems,
    onChange,
    preserveUnknownSelectedItem,
    selectedItem,
  } = dropdownProps;

  const optionItems = useDropdownOptions({
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
    preserveUnknownSelectedItem,
    selectedItem,
  });

  return (
    <DropdownMenuFilteredGroups
      dropdownProps={dropdownProps}
      filterText={filterText}
      optionItems={optionItems}
    />
  );
}

export default DropdownMenuContent;
