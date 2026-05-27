import { ChangeEvent, useCallback, useMemo, useState } from 'react';

import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { TreeViewDataItem } from '@patternfly/react-core';

import { HIDE, SHOW, SHOW_EMPTY_NAMESPACES_KEY } from '../utils/constants';
import { filterItems, filterNamespaceItems } from '../utils/utils';

type UseFilteredTreeView = (treeData: TreeViewDataItem[]) => {
  filteredTreeData: TreeViewDataItem[];
  onSearch: (event: ChangeEvent<HTMLInputElement>) => void;
  searchText: string;
};

const useFilteredTreeView: UseFilteredTreeView = (treeData) => {
  const [showEmptyNamespaces] = useLocalStorage(SHOW_EMPTY_NAMESPACES_KEY, HIDE);
  const [filteredItems, setFilteredItems] = useState<TreeViewDataItem[]>(null);
  const [searchText, setSearchText] = useState('');

  const onSearch = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value;
      setSearchText(input);

      if (input === '') {
        return setFilteredItems(null);
      }

      const filtered = treeData
        .map((opt) => Object.assign({}, opt))
        .filter((item) => filterItems(item, input));

      setFilteredItems(filtered);
    },
    [treeData],
  );

  const filteredTreeData = useMemo(() => {
    const items = filteredItems ?? treeData;

    return items
      .map((opt) => Object.assign({}, opt))
      .filter((item) => filterNamespaceItems(item, showEmptyNamespaces === SHOW));
  }, [filteredItems, treeData, showEmptyNamespaces]);

  return { filteredTreeData, onSearch, searchText };
};

export default useFilteredTreeView;
