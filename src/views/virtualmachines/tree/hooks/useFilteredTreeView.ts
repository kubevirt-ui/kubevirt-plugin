import { ChangeEvent, useCallback, useMemo, useState } from 'react';

import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { isSystemNamespace } from '@kubevirt-utils/resources/namespace/helper';
import { TreeViewDataItem } from '@patternfly/react-core';

import { HIDE, PROJECT_SELECTOR_PREFIX, SHOW, SHOW_EMPTY_PROJECTS_KEY } from '../utils/constants';
import { filterItems, filterNamespaceItems } from '../utils/utils';

type UseFilteredTreeView = (treeData: TreeViewDataItem[]) => {
  filteredTreeData: TreeViewDataItem[];
  onSearch: (event: ChangeEvent<HTMLInputElement>) => void;
};

const useFilteredTreeView: UseFilteredTreeView = (treeData) => {
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
    },
    [treeData],
  );

  const filteredTreeData = useMemo(() => {
    const items = filteredItems ?? treeData;

    const hasNonSystemNamespaces = items
      .filter((item) => item.id?.startsWith(PROJECT_SELECTOR_PREFIX))
      .some((item) => !isSystemNamespace(item.name as string));

    return items
      .map((opt) => Object.assign({}, opt))
      .filter((item) =>
        filterNamespaceItems(item, showEmptyProjects === SHOW, hasNonSystemNamespaces),
      );
  }, [filteredItems, treeData, showEmptyProjects]);

  return { filteredTreeData, onSearch };
};

export default useFilteredTreeView;
