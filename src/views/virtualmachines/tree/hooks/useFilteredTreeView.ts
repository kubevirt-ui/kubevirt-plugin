import type { ChangeEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';

import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import type { TreeViewDataItem } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';

import { HIDE, SHOW, SHOW_EMPTY_PROJECTS_KEY } from '../utils/constants';
import { vmsSignal } from '../utils/signals';
import {
  filterItems,
  filterNamespaceItems,
  getEffectiveShowEmptyProjects,
  shallowCloneTreeViewItems,
} from '../utils/utils';

type UseFilteredTreeView = (treeData: TreeViewDataItem[]) => {
  filteredTreeData: TreeViewDataItem[];
  hasVMs: boolean;
  onSearch: (event: ChangeEvent<HTMLInputElement>) => void;
  searchText: string;
};

const useFilteredTreeView: UseFilteredTreeView = (treeData) => {
  useSignals();
  const [showEmptyProjects] = useLocalStorage(SHOW_EMPTY_PROJECTS_KEY, HIDE);
  const [searchText, setSearchText] = useState('');
  const hasVMs = !isEmpty(vmsSignal.value);
  const effectiveShowEmptyProjects = getEffectiveShowEmptyProjects(hasVMs, showEmptyProjects);

  const onSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  }, []);

  const filteredTreeData = useMemo(() => {
    const clonedTreeData = shallowCloneTreeViewItems(treeData);
    return clonedTreeData.filter((item) => {
      const matchesTreeSearch = !searchText || filterItems(item, searchText);
      return matchesTreeSearch && filterNamespaceItems(item, effectiveShowEmptyProjects === SHOW);
    });
  }, [effectiveShowEmptyProjects, searchText, treeData]);

  return { filteredTreeData, hasVMs, onSearch, searchText };
};

export default useFilteredTreeView;
