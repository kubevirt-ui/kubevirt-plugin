import { ChangeEvent, useCallback, useMemo, useState } from 'react';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
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
  const isAdmin = useIsAdmin();
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

    const nonAdminItems =
      items
        .filter((item) => item.id?.startsWith(PROJECT_SELECTOR_PREFIX))
        .some((item) => !isSystemNamespace(item.name as string)) ||
      items
        .flatMap((item) => item.children || [])
        .filter((child) => child.id?.startsWith(PROJECT_SELECTOR_PREFIX))
        .some((child) => !isSystemNamespace(child.name as string));

    const hasNonSystemNamespaces = isAdmin ? false : nonAdminItems;

    return items
      .map((opt) => Object.assign({}, opt))
      .filter((item) =>
        filterNamespaceItems(item, showEmptyProjects === SHOW, hasNonSystemNamespaces),
      );
  }, [filteredItems, treeData, showEmptyProjects, isAdmin]);

  return { filteredTreeData, onSearch };
};

export default useFilteredTreeView;
