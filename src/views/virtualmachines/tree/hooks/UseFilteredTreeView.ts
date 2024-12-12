import { ChangeEvent, Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';

import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { TreeViewDataItem } from '@patternfly/react-core';

import { HIDE, SHOW, SHOW_EMPTY_PROJECTS_KEY } from '../utils/constants';
import { filterItems, filterNamespaceItems } from '../utils/utils';

type UseFilteredTreeView = (
  treeData: TreeViewDataItem[],
  setShowAll: Dispatch<SetStateAction<boolean>>,
) => {
  filteredTreeData: TreeViewDataItem[];
  onSearch: (event: ChangeEvent<HTMLInputElement>) => void;
};

const useFilteredTreeView: UseFilteredTreeView = (treeData, setShowAll) => {
  const [showEmptyProjects] = useLocalStorage(SHOW_EMPTY_PROJECTS_KEY, HIDE);
  const [filteredItems, setFilteredItems] = useState<TreeViewDataItem[]>();

  const onSearch = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value;
      if (input === '') {
        return setFilteredItems(null);
      }

      const filtered = treeData
        .map((opt) => Object.assign({}, opt))
        .filter((item) => filterItems(item, input));

      setFilteredItems(filtered);
      setShowAll(true);
    },
    [treeData, setShowAll],
  );

  const filteredTreeData = useMemo(() => {
    const items = filteredItems ?? treeData;
    return items
      .map((opt) => Object.assign({}, opt))
      .filter((item) => filterNamespaceItems(item, showEmptyProjects === SHOW));
  }, [filteredItems, treeData, showEmptyProjects]);

  return {
    filteredTreeData,
    onSearch,
  };
};

export default useFilteredTreeView;
