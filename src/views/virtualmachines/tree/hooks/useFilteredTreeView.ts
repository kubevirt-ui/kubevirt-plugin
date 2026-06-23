import { ChangeEvent, useCallback, useMemo, useState } from 'react';

import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { TreeViewDataItem } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';

import { HIDE, SHOW, SHOW_EMPTY_PROJECTS_KEY } from '../utils/constants';
import { vmsSignal } from '../utils/signals';
import { filterItems, filterNamespaceItems, getEffectiveShowEmptyProjects } from '../utils/utils';

type UseFilteredTreeView = (treeData: TreeViewDataItem[]) => {
  filteredTreeData: TreeViewDataItem[];
  hasVMs: boolean;
  onSearch: (event: ChangeEvent<HTMLInputElement>) => void;
  searchText: string;
};

const useFilteredTreeView: UseFilteredTreeView = (treeData) => {
  useSignals();
  const [showEmptyProjects] = useLocalStorage(SHOW_EMPTY_PROJECTS_KEY, HIDE);
  const [filteredItems, setFilteredItems] = useState<TreeViewDataItem[]>(null);
  const [searchText, setSearchText] = useState('');
  const hasVMs = !isEmpty(vmsSignal.value);
  const effectiveShowEmptyProjects = getEffectiveShowEmptyProjects(hasVMs, showEmptyProjects);

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
      .filter((item) => filterNamespaceItems(item, effectiveShowEmptyProjects === SHOW));
  }, [effectiveShowEmptyProjects, filteredItems, treeData]);

  return { filteredTreeData, hasVMs, onSearch, searchText };
};

export default useFilteredTreeView;
