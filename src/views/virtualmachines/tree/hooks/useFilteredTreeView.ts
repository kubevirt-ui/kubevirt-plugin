import { useMemo } from 'react';

import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { TreeViewDataItem } from '@patternfly/react-core';

import { HIDE, SHOW, SHOW_EMPTY_PROJECTS_KEY } from '../utils/constants';
import { filterNamespaceItems } from '../utils/utils';

type UseFilteredTreeView = (treeData: TreeViewDataItem[]) => TreeViewDataItem[];

const useFilteredTreeView: UseFilteredTreeView = (treeData) => {
  const [showEmptyProjects] = useLocalStorage(SHOW_EMPTY_PROJECTS_KEY, HIDE);

  const filteredTreeData = useMemo(() => {
    const items = treeData;
    return items
      .map((opt) => Object.assign({}, opt))
      .filter((item) => filterNamespaceItems(item, showEmptyProjects === SHOW));
  }, [treeData, showEmptyProjects]);

  return filteredTreeData;
};

export default useFilteredTreeView;
