import { ChangeEvent, Dispatch, SetStateAction, useCallback, useState } from 'react';

import { TreeViewDataItem } from '@patternfly/react-core';

import { filterItems } from '../utils/utils';

type UseTreeViewSearch = (treeData: TreeViewDataItem[]) => {
  filteredItems: TreeViewDataItem[];
  onSearch: (event: ChangeEvent<HTMLInputElement>) => void;
  setShowAll: Dispatch<SetStateAction<boolean>>;
  showAll: boolean;
};

export const useTreeViewSearch: UseTreeViewSearch = (treeData) => {
  const [filteredItems, setFilteredItems] = useState<TreeViewDataItem[]>();
  const [showAll, setShowAll] = useState<boolean>();

  const onSearch = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value;
      if (input === '') {
        return setFilteredItems(treeData);
      }

      const filtered = treeData
        .map((opt) => Object.assign({}, opt))
        .filter((item) => filterItems(item, input));

      setFilteredItems(filtered);
      setShowAll(true);
    },
    [treeData],
  );

  return {
    filteredItems,
    onSearch,
    setShowAll,
    showAll,
  };
};
